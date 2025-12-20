
const moment = require("moment")
const md5 = require("md5")
const nodemailer = require("nodemailer")
const crypto = require("crypto")
const ejs = require("ejs")
const path = require("path")

const { Op, Sequelize } = require("sequelize")

const Translation = require("../models/Translation")
const ContactInfo = require("../models/ContactInfo")
const WorkingHour = require("../models/WorkingHour")
const AreaToggle = require("../models/AreaToggle")
const Meta = require("../models/Meta")
const SystemInfo = require("../models/SystemInfo")
const AlertClinic = require("../models/AlertClinic")
const FVsLanguage = require("../models/FVsLanguage")
const PatientList = require("../models/PatientList")
const PageImg = require("../models/PageImg")
const Vault = require("../models/Vault")
const Setting = require("../models/Setting")
const FComContact = require('../models/FComContact')
const Staff = require('../models/Staff')
const CommunicationTrack = require("../models/CommunicationTrack")

const { getCaptcha } = require("../utils/captcha")
const { generateQRCode } = require("../utils/qrcode")

const transporter = nodemailer.createTransport({
	host: process.env.MAIL_HOST,
	port: process.env.MAIL_PORT,
	secure: false,
	auth: {
		user: process.env.MAIL_USERNAME,
		pass: process.env.MAIL_PASSWORD,
	},
})

const deleteExpiredVaultDocuments = async patient_id => {
	const expiredRangeSetting = await Setting.findOne({
        where: { type: 'vault_doc_del_timeout' },
        attributes: ['value']
    });

    const expiredRange = expiredRangeSetting ? expiredRangeSetting.value : 0 // Default to 0 if not found

    // Current date
    const currDate = moment().format('YYYY-MM-DD')

    // Get vault documents for the patient
    const vaults = await Vault.findAll({
        where: { patient_id: patient_id }
    });

    // Check each vault document and delete if expired
    for (const vault of vaults) {
        const submitDate = moment(vault.submit_date)
        const expiredDate = submitDate.add(expiredRange, 'days').format('YYYY-MM-DD')

        if (currDate > expiredDate) {
            await Vault.destroy({
                where: { id: vault.id }
            })
        }
    }
}

exports.render = async (req, res, next) => {
	let data = {}

	data.isLoggedIn = req.session.isLoggedIn ? req.session.isLoggedIn : false

	//
	data.page_tag = "vault"
	data.page_title = "THE HEIGHTS WELLNESS - Vault"
	data.page_desc = "The Heights Wellness Medical Service"
	data.site_url = process.env.SITE_URL
	data.og_title = "The Heights Wellness"
	data.og_desc = "The Heights Wellness Medical Service"
	data.twitter_title = "The Heights Wellness"
	data.twitter_desc = "The Heights Wellness Medical Service"

	data.public_key = process.env.ENCRYPT_PUBLIC_KEY
	data.stripe_key = process.env.STRIPE_PUBLIC_KEY

	const siteLang = req.session.language ? req.session.language : "es"
	data.language = siteLang
	
	const captcha = await getCaptcha(6, 2, false)
	data.captcha_image = captcha.captcha
	req.session.ying = captcha.key

	const footer_captcha = await getCaptcha(6, 2, false)
	data.footer_captcha_image = footer_captcha.captcha
	req.session.ying_footer = footer_captcha.key

	data.patient_id = req.session.patient_id

	// All text
	const translations = await Translation.findAll()
	data.component_text = []
	translations.forEach(item => { data.component_text[item.keyvalue] = item[siteLang] })

	data.contact_info = await ContactInfo.findOne({ where: { id: 1 } })

	const working_hours = await WorkingHour.findAll()
	data.working_hours = []
	working_hours.forEach(item => { siteLang == "en" ? data.working_hours.push({name: item.en_name, time: item.en_time}) : data.working_hours.push({name: item.es_name, time: item.es_time}) })

	const area_toggle = await AreaToggle.findAll()
	data.area_toggle = []
	area_toggle.forEach(item => { data.area_toggle[item.area_id] = item.status })

	data.meta = await Meta.findAll()

	data.acronym = data.contact_info.acronym

	let attributes = siteLang === "en" ? [
		'id',
		'page',
		'position',
		'img',
		['title_en', 'title'],
		['desc_en', 'desc']
	] : [
		'id',
		'page',
		'position',
		'img',
		['title_es', 'title'],
		['desc_es', 'desc']
	]
	const _header_banner = await PageImg.findAll({ attributes: attributes, where: { status: 1, page: "Home", position: "HEADER-BANNER" } })
	data.HEADER_BANNER = []
	_header_banner.forEach(item => { data.HEADER_BANNER.push(item.dataValues) })

	const sysinfo = await SystemInfo.findAll()
	data.sysinfo = { month: sysinfo[0].value, year: sysinfo[1].value, work: sysinfo[2].value, word: sysinfo[3].value, language: sysinfo[4].value }

	attributes = siteLang === "en" ? [
		'id',
		'title',
		'description',
		'message',
		'start',
		'end',
		'image',
		'createdAt'
	] : [
		'id',
		['title_es', 'title'],
		['description_es', 'desc'],
		['message_es', 'message'],
		'start',
		'end',
		'image',
		'createdAt'
	]
	data.alerts = await AlertClinic.findAll({ attributes:attributes, where: { end: { [Op.gte]: new Date(Date.now()) }, start: { [Op.lte]: new Date(Date.now()) }, status: 1 } })

	data.languages = await FVsLanguage.findAll()

	// QR Code
	let qrcode_text = `NAME : ${data.contact_info.name} \n`
	qrcode_text += `EMAIL : ${data.contact_info.email} \n`
	qrcode_text += `SITE : ${process.env.SITE_URL} \n`
	qrcode_text += `ADDRESS : ${data.contact_info.address} \n`
	qrcode_text += `CITY : ${data.contact_info.city} \n`
	qrcode_text += `ZIP Code : ${data.contact_info.zip} \n`
	qrcode_text += `TEL : ${data.contact_info.tel} \n`
	qrcode_text += `FAX : ${data.contact_info.fax}`
	data.footer_qrcode = await generateQRCode(qrcode_text)

	if (req.session.patient_id) {
		data.patient_info = await PatientList.findOne({ where: { id: req.session.patient_id } })

		data.patient_name = data.patient_info.fname + " " + data.patient_info.lname

		deleteExpiredVaultDocuments(req.session.patient_id)
    data.vault = await Vault.findAll({ where: { patient_id: req.session.patient_id }, order: [["submit_date", "DESC"], ["id", "DESC"]] })
	} else {
		data.patient_info = {
			id: 0,
			patient_id: 0,
			fname: "",
			lname: "",
			mname: "",
			gender: "M",
			dob: "",
			email: "",
			phone: "",
			mobile: "",
			address: "",
			city: "",
			state: "",
			zip: "",
			languag: 17,
			ethnicity: "",
			race: ""
		}

		data.patient_name = ""
	}
	
	res.render('layout', data)
}

exports.getContacts = async (req, res, next) => {
	const { patient_id, pt_emr_id } = req.body

	const contacts = await FComContact.findAll({
		attributes: {
			include: [
				// Including the assigned_name as en_name from the staff model
				[Sequelize.col('staff.en_name'), 'assigned_name']
			]
		},
		include: [{
			model: Staff,
			as: 'staff', // Assuming the alias in the association is 'staff'
			required: false, // For LEFT JOIN
			attributes: [] // We don't need the entire staff fields, just 'assigned_name'
		}],
		where: {
			pt_emr_id: pt_emr_id,
			clinic_id: process.env.CLINIC_ID, // Assuming clinicId is provided
			new_status: 1
		},
		order: [['id', 'DESC']]
	})

	res.status(200).json({ data: contacts })
}

exports.updatePatient = async (req, res, next) => {
	const data = req.body
	try {
		await PatientList.update({
			patient_id: data.patient_id,
			fname: data.fname,
			lname: data.lname,
			mname: data.mname,
			phone: data.phone,
			mobile: data.mobile,
			email: data.email,
			address: data.address,
			city: data.city,
			state: data.state,
			zip: data.zip,
			gender: data.gender,
			dob: new Date(data.dob),
			language: data.language,
			ethnicity: data.ethnicity,
			race: data.race,
			status: data.status
		}, { where: { id: data.id } })

		return res.status(200).json({ status: "success" })
	} catch (error) {
		return res.status(200).json({ status: "error", message: error.message })
	}
}

exports.resetPassword = async (req, res, next) => {
	const id = req.body.id
	const password = req.body.pwd

	try {
		await PatientList.update({ password: md5(password) }, { where: { id: id } })

		return res.status(200).json({ status: "success" })
	} catch (error) {
		return res.status(200).json({ status: "error", message: error.message })
	}
}

exports.viewCommunicationHistory = async (req, res, next) => {
	const id = req.body.id
	const case_number = req.body.case_number
	const staff_id = req.body.assign
	const patient_id = req.body.patient_id
	const person_type = req.body.person_type

	try {
		// clear unread count
		const updateData = person_type === "patient" ? { pt_unread_count: 0 } : { sf_unread_count: 0 }
		await FComContact.update(updateData, { where: { id: id } })
		// set seen
		await CommunicationTrack.update({ seen: 1 }, { where: { case_number: case_number, patient_id: patient_id, staff_id: staff_id, person_type: person_type } })
		// get view communication history
		const commHistory = await CommunicationTrack.findAll({ where: { case_number: case_number, patient_id: patient_id, staff_id: staff_id } })
		// get view track
		const contact = await FComContact.findOne({
			where: { id: id },
			attributes: {
				include: [
					[Sequelize.col('staff.en_name'), 'staff_name'],
					[Sequelize.col('staff.email'), 'staff_email'],
					[Sequelize.col('staff.tel'), 'staff_tel'],
					[Sequelize.col('patient.language'), 'patient_lang'],
					[Sequelize.col('patient.gender'), 'patient_sex']
				]
			},
			include: [{
				model: Staff,
				as: 'staff',
				attributes: [], // don't select all staff fields, just the ones in col()
				required: false
			}, {
				model: PatientList,
				as: 'patient',
				attributes: [], // same here
				required: false
			}],
			raw: true // returns plain object like row_array()
		})

		return res.status(200).json({ history: commHistory, contact: contact, status: "success" })
	} catch (error) {
		return res.status(200).json({ history: [], contact: [], status: "error" })
	}
}

exports.addMessage = async (req, res, next) => {
	const contactInfo = await ContactInfo.findOne({ where: { id: 1 } })
	const acronym = contactInfo.acronym
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

	const staff = await Staff.findOne({ where: { id: assign } })
	const contact = await FComContact.findOne({ where: {id: contact_id} })
	const dob = new Date(contact.dob)

	try {
		const communication = {
			message: message,
			case_number: case_number,
			patient_id: patient_id,
			staff_id: assign,
			person_type: person_type,
			created_time: new Date(Date.now())
		}

		// set unread count
		if (person_type === "staff") {
			const res = await FComContact.findOne({ attributes: ["pt_unread_count"], where: { id: contact_id } })
			await FComContact.update({ pt_unread_count: res.pt_unread_count + 1, date: new Date(Date.now()) }, { where: { id: contact_id } })
		} else if (person_type === "patient") {
			const res = await FComContact.findOne({ attributes: ["sf_unread_count"], where: { id: contact_id } })
			await FComContact.update({ sf_unread_count: res.sf_unread_count + 1, date: new Date(Date.now()) }, { where: { id: contact_id } })
		}

		// add to communication track
		await CommunicationTrack.create(communication)
	} catch(error) {
		return res.status(200).json({ status: "error"})
	}

	// send email begin //
	const emailSubject = "CASE # : " + case_number + acronym + " " + contact.reason + " - Email From" + contactInfo.name

	const emailConfig = {
		site_url: process.env.SITE_URL,
		id: 0,
		acronym: acronym,
		title: "Email From" + contactInfo.name,
		subject: "Email From" + contact.name,
		reason: contact.reason,
		name: contact.name,
		email: contact.email,
		cel: contact.cel,
		dob: dob.toLocaleDateString(),
		message: message,
		besttime: contact.best_time,
		opt_in: contact.opt_status === 1 ? "Yes" : "No"
	}
	ejs.renderFile(path.join(__dirname, '../views/email/contactemail.ejs'), emailConfig, (error, data) => {
		if (error) {
			return res.status(200).json({ status: "error"})
		} else {
			const mailOptions = {
				from: process.env.MAIL_USERNAME,
				to: staff.email,
				subject: emailSubject,
				html: data
			}

			transporter.sendMail(mailOptions, (error, info) => {
				if (error) {
					console.error(err)
					return res.status(200).json({ status: "error"})
				} else {
					return res.status(200).json({ status: "success"})
				}
			})
		}
	})
	// send email end //
}
