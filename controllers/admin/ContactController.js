
const path = require("path")
const nodemailer = require("nodemailer")
const ejs = require("ejs")
const axios = require("axios")
const crypto = require("crypto")

const AreaToggle = require("../../models/AreaToggle")
const Translation = require("../../models/Translation")
const ContactInfo = require("../../models/ContactInfo")
const FComContact = require("../../models/FComContact")
const PatientList = require("../../models/PatientList")
const Staff = require("../../models/Staff")
const CommunicationTrack = require("../../models/CommunicationTrack")
const TrackComments = require("../../models/TrackComments")

const { Sequelize, Op } = require("sequelize")

const { saveQRode } = require("../../utils/qrcode")

const transporter = nodemailer.createTransport({
	host: process.env.MAIL_HOST,
	port: process.env.MAIL_PORT,
	secure: false,
	auth: {
		user: process.env.MAIL_USERNAME,
		pass: process.env.MAIL_PASSWORD,
	},
})

exports.render = async (req, res, next) => {
	let data = {}

	data.sideItem = "contacts"
	data.site_url = process.env.SITE_URL
	data.prefix = process.env.PREFIX_URL
	data.google_api_key = process.env.GOOGLE_API_KEY
	data.menus = req.session.adminUser.access_rights
	data.userType = req.session.adminUser.type
	data.loginTime = req.session.loginTime
	data.expiredTime = req.session.expiredTime
	data.userFullName = req.session.adminUser.fname + " " + req.session.adminUser.lname

	const _a = await AreaToggle.findAll()
	data.area_toggle = {}
	_a.forEach(item => { data.area_toggle[item.area_id] = item.status })

	const _t = await Translation.findAll()
	data.component= []
	_t.forEach(item => { data.component[item.keyvalue] = [], data.component[item.keyvalue].en = item.en, data.component[item.keyvalue].es = item.es })

	data.contact_info = await ContactInfo.findOne({ where: { id: 1 } })
	
	res.render('admin/contacts', data)
}

exports.updateContactDesc = async (req, res, next) => {
    const desc_en = req.body.desc_en
    const desc_es = req.body.desc_es

    await Translation.update({ en: desc_en, es: desc_es }, { where: { keyvalue: "t_contact_desc" } })

    res.status(200).json({ status: "success" })
}

exports.getAllContacts = async (req, res, next) => {
	const status = req.body.status
	const reason = req.body.reason
	const assigned = req.body.assigned
	const start_date = new Date(req.body.start_date)
	const end_date = new Date(req.body.end_date)

	const clinic_id = process.env.CLINIC_ID; // Assuming you have a config object

    const contacts = await FComContact.findAll({
        attributes: [
            "id", "identifier", "clinic_id", "pt_emr_id", "type", "case_number", "based_on", "part_of", "category", "priority", "medium", "subject", "sent", "received", "assign", "status", "reason", "date", "new_status", "best_time", "date", "opt_status", "survey_id", "closed_date", "message", "cel", "dob", "email", "name", "reason", "msg_type",
            [Sequelize.col('patient.fname'), 'patient_fname'],
            [Sequelize.col('patient.lname'), 'patient_lname'],
            [Sequelize.col('patient.dob'), 'patient_dob'],
            [Sequelize.col('patient.gender'), 'patient_sex'],
            [Sequelize.col('patient.language'), 'patient_lang'],
            [Sequelize.col('staff.en_name'), 'assigned_name']
        ],
        include: [{
			model: PatientList,
			as: 'patient',
			attributes: [], // No additional attributes needed from PatientList
			required: false, // Left join
		}, {
			model: Staff,
			as: 'staff',
			attributes: [], // No additional attributes needed from Staff
			required: false, // Left join
		}],
        where: {
            clinic_id: clinic_id,
            new_status: 1,
            ...(status > 0 ? { status } : {}),
            ...(reason !== "All Reason" ? { reason } : {}),
            ...(assigned !== "all" ? { assign: assigned } : {}),
            date: {
                [Op.between]: [start_date, end_date]
            }
        },
        order: [['date', 'DESC']]
    })

	res.status(200).json({ data: contacts })
}

exports.viewContact = async (req, res, next) => {
	const id = req.body.id
	const contact = await FComContact.findOne({
        attributes: [
            "id", "identifier", "clinic_id", "pt_emr_id", "type", "case_number", "based_on", "part_of", "category", "priority", "medium", "subject", "sent", "received", "assign", "status", "reason", "date", "new_status", "best_time", "date", "opt_status", "survey_id", "closed_date", "message", "cel", "dob", "email", "name", "reason", "msg_type",
            [Sequelize.col('staff.en_name'), 'staff_name'],
            [Sequelize.col('staff.email'), 'staff_email'],
            [Sequelize.col('staff.tel'), 'staff_tel'],
            [Sequelize.col('patient.language'), 'patient_lang'],
            [Sequelize.col('patient.gender'), 'patient_sex']
        ],
        include: [{
			model: Staff,
			as: 'staff',
			attributes: [], // No additional attributes needed from Staff
			required: false, // Left join
        }, {
			model: PatientList,
			as: 'patient',
			attributes: [], // No additional attributes needed from PatientList
			required: false, // Left join
        }],
        where: { id: id }
    })

	res.status(200).json({ data: contact })
}

exports.viewCommunicationHistory = async (req, res, next) => {
	const id = req.body.id
	const case_number = req.body.case_number
	const staff_id = req.body.assign
	const patient_id = req.body.patient_id
	const person_type = req.body.person_type

	// clear unread count
	let info = {}
	if (person_type === "patient") {
		info.pt_unread_count = 0
	} else if (person_type === "staff") {
		info.sf_unread_count = 0
	}
	await FComContact.update(info, { where: { id: id } })

	// set seen
	await CommunicationTrack.update({ seen: 1 }, { where: { case_number: case_number, patient_id: patient_id, staff_id: staff_id, person_type: person_type } })

	// view communication history
	const histories = await CommunicationTrack.findAll({ where: { case_number: case_number, patient_id: patient_id, staff_id: staff_id } })

	// view track
	const contacts = await FComContact.findOne({
        attributes: [
            "id", "identifier", "clinic_id", "pt_emr_id", "type", "case_number", "based_on", "part_of", "category", "priority", "medium", "subject", "sent", "received", "assign", "status", "reason", "date", "new_status", "best_time", "date", "opt_status", "survey_id", "closed_date", "message", "cel", "dob", "email", "name", "reason", "msg_type",
            [Sequelize.col('staff.en_name'), 'staff_name'],
            [Sequelize.col('staff.email'), 'staff_email'],
            [Sequelize.col('staff.tel'), 'staff_tel'],
            [Sequelize.col('patient.language'), 'patient_lang'],
            [Sequelize.col('patient.gender'), 'patient_sex']
        ],
        include: [{
			model: Staff,
			as: 'staff',
			attributes: [], // No additional attributes needed from Staff
			required: false, // Left join
		}, {
			model: PatientList,
			as: 'patient',
			attributes: [], // No additional attributes needed from PatientList
			required: false, // Left join
		}],
        where: { id: id }
    })

	res.status(200).json({ history: histories, contact: contacts, status: "success" })
}

exports.deleteContact = async (req, res, next) => {
	const id = req.body.id

	// select track by the id
	const contact = await FComContact.findOne({ where: { id: id } })

	// send to central begin //
	const centralData = {
		case_number: contact.case_number
	}
	try {
		await axios.post(process.env.CENTER_URL + "/api/deleteContactTrackByCase", centralData)
	} catch (error) {
	}
	// send to central end //

	// delete track
	await FComContact.destroy({ where: { case_number: contact.case_number } })
	await CommunicationTrack.destroy({ where: { case_number: contact.case_number } })

	res.status(200).json({ status: "success" })
}

exports.updateTrack = async (req, res, next) => {
	const id = req.body.id
	const patient_id = req.body.patient_id
	const case_number = req.body.case_number
	const assign = req.body.assign
	const priority = req.body.priority
	const status = req.body.status
	const old_status = req.body.old_status
	const comment = req.body.comment
	const closed_date = status === 3 ? new Date(Date.now()) : null

	// send to central begin //
	const centralData = {
		case_number: case_number,
		assign: assign,
		priority: priority,
		status: status
	}
	axios.post(process.env.CENTER_URL + "/api/updateContactTrackByCase", centralData).then(() => {
		console.log("OK")
	}).catch(err => {
		console.error(err)
	})
	// send to central end //

	if (old_status !== status) {
		const _t = await Translation.findAll()
		let componentText = []
		_t.forEach(item => { componentText[item.keyvalue] = [], componentText[item.keyvalue].en = item.en, componentText[item.keyvalue].es = item.es })

		const contactInfo = await ContactInfo.findOne({ where: { id: 1 } })

		const trackInfo = await FComContact.findOne({
			attributes: [
				"id", "identifier", "clinic_id", "pt_emr_id", "type", "case_number", "based_on", "part_of", "category", "priority", "medium", "subject", "sent", "received", "assign", "status", "reason", "date", "new_status", "best_time", "date", "opt_status", "survey_id", "closed_date", "message", "cel", "dob", "email", "name", "reason", "msg_type",
				[Sequelize.col('staff.en_name'), 'staff_name'],
				[Sequelize.col('staff.email'), 'staff_email'],
				[Sequelize.col('staff.tel'), 'staff_tel'],
				[Sequelize.col('patient.language'), 'patient_lang'],
				[Sequelize.col('patient.gender'), 'patient_sex']
			],
			include: [{
				model: Staff,
				as: 'staff',
				attributes: [], // No additional attributes needed from Staff
				required: false, // Left join
			}, {
				model: PatientList,
				as: 'patient',
				attributes: [], // No additional attributes needed from PatientList
				required: false, // Left join
			}],
			where: { id: id }
		})

		// generate qrcode begin //
		let qrcode_text = `NAME : ${trackInfo.name} \n`
		qrcode_text += `EMAIL : ${trackInfo.email} \n`
		qrcode_text += `URL : ${process.env.SITE_URL}/login`
		await saveQRode(qrcode_text, "./assets/images/common/qrcode.png")
		// generate qrcode end //

		// send email begin //
		let subject = status === 3 ? componentText.t_pa_ec_subject.en : componentText.t_pa_eu_subject.en
		subject = subject.replace(/\$case;/g, case_number)
		subject = subject.replace(/\$acr;/g, contactInfo.acronym)

		let body = status === 3 ? componentText.t_pa_ec_etext.en : componentText.t_pa_eu_etext.en
		body = body.replace(/\$case;/g, case_number)
		body = body.replace(/\$acr;/g, contactInfo.acronym)
		body = body.replace(/\$br;/g, "<br>")
		body = body.replace(/\$patient_name;/g, trackInfo.name)

		const emailConfig = {
			site_url: process.env.SITE_URL,
			acronym: contactInfo.acronym,
			contact_info: contactInfo,
			status: status,
			subject: subject,
			body: body,
			url: process.env.SITE_URL + "/login",
			qrcode: "./assets/images/common/qrcode.png"
		}
		const emailSubject = `Case ${contactInfo.acronym}${case_number}# : Email From ${contactInfo.name}`
		ejs.renderFile(path.join(__dirname, '../../views/email/emailupdate.ejs'), emailConfig, (error, data) => {
			if (error) {
				res.status(200).json({ status: "error", id: case_number })
			} else {
				const mailOptions = {
					from: process.env.MAIL_USERNAME,
					to: trackInfo.email,
					subject: emailSubject,
					html: data
				}

				transporter.sendMail(mailOptions, (error, info) => { })
			}
		})
		// send email end //
	}

	// add updated contact
	let theContact = await FComContact.findOne({ where: { id: id } })
	const newContact = {
		pt_emr_id: theContact.pt_emr_id,
		clinic_id: theContact.clinic_id,
		type: theContact.type,
		reason: theContact.reason,
		name: theContact.name,
		sender: theContact.name,
		dob: theContact.dob,
		email: theContact.email,
		cel: theContact.cel,
		patient_type: theContact.patient_type,
		subject: theContact.subject,
		message: theContact.message,
		best_time: theContact.best_time,
		opt_status: theContact.opt_status,
		lang: theContact.lang,
		priority: priority,
		status: status,
		assign: assign,
		case_number: theContact.case_number,
		new_status: 1,
		date: new Date(Date.now()),
		sent: theContact.sent,
		msg_type: theContact.msg_type,
		m_delivered: 0,
		m_seen: 0,
		closed_date: closed_date
	}
	await FComContact.create(newContact)
	await FComContact.update({ new_status: 0 }, { where: { id: id } })

	// add comment
	if (comment) {
		await TrackComments.create({ trackid: id, userid: req.session.adminUser.id, comment: comment, created: new Date(Date.now()) })
	}

	res.status(200).json({ status: "success" })
}

exports.addMessage = async (req, res, next) => {
	const privateKey = process.env.ENCRYPT_PRIVATE_KEY
	// decrypt function
	const decryptedData = data => {
        try {
			const buffer = Buffer.from(data, 'base64')
			const decrypted = crypto.privateDecrypt({ key: privateKey, padding: crypto.constants.RSA_PKCS1_PADDING }, buffer)
			return decrypted.toString()
		} catch (err) {
			console.error("Decryption Failed : ", err)
		}
    }

	const contact_id = req.body.contact_id
	const message = req.body.message
	const case_number = req.body.case_number
	const patient_id = req.body.patient_id
	const assign = req.body.assign
	const person_type = req.body.person_type

	const contactInfo = await ContactInfo.findOne({ where: { id: 1 } })
	const contact = await FComContact.findOne({ where: { id: contact_id } })

	// send email begin //
	const emailConfig = {
		id: 0,
		site_url: process.env.SITE_URL,
		acronym: contactInfo.acronym,
		title: `Email From ${contactInfo.name}`,
		subject: `Message From ${contact.name}`,
		reason: contact.reason,
		name: contact.name,
		email: contact.email,
		cel: contact.cel,
		dob: new Date(contact.dob).toLocaleDateString(),
		message: message,
		besttime: contact.best_time,
		opt_in: ""
	}
	const emailSubject = `Case ${contactInfo.acronym}${case_number}# : ${contact.reason} - Email From ${contactInfo.name}`
	ejs.renderFile(path.join(__dirname, '../../views/email/contactemail.ejs'), emailConfig, (error, data) => {
		if (error) {
		} else {
			const mailOptions = {
				from: process.env.MAIL_USERNAME,
				to: contact.email,
				subject: emailSubject,
				html: data
			}

			transporter.sendMail(mailOptions, (error, info) => {})
		}
	})
	// send email end //

	// set unread count
	await FComContact.update(person_type === "staff" ? { pt_unread_count: contact.pt_unread_count + 1, date: new Date(Date.now()) } : { sf_unread_count: contact.sf_unread_count + 1, date: new Date(Date.now()) }, { where: { id: contact_id } })
	// add message
	await CommunicationTrack.create({ message: message, case_number: case_number, patient_id: patient_id, staff_id: assign, person_type: person_type, created_time: new Date(Date.now()) })

	res.status(200).json({ status: "success" })
}
