
const fs = require("fs")
const path = require("path")
const nodemailer = require("nodemailer")
const crypto = require("crypto")
const md5 = require("md5")
const ejs = require("ejs")
const axios = require("axios")
const moment = require("moment")

const { Op } = require("sequelize")

const Translation = require("../models/Translation")
const ContactInfo = require("../models/ContactInfo")
const WorkingHour = require("../models/WorkingHour")
const AreaToggle = require("../models/AreaToggle")
const Meta = require("../models/Meta")
const Doctor = require("../models/Doctor")
const Staff = require("../models/Staff")
const PatientReview = require("../models/PatientReview")
const SystemInfo = require("../models/SystemInfo")
const AlertClinic = require("../models/AlertClinic")
const FVsLanguage = require("../models/FVsLanguage")
const ClinicService = require("../models/ClinicService")
const PatientList = require("../models/PatientList")
const PageImg = require("../models/PageImg")
const FComContact = require("../models/FComContact")
const Managers = require("../models/Managers")

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

exports.render = async (req, res, next) => {
	let data = {}

	data.isLoggedIn = req.session.isLoggedIn ? req.session.isLoggedIn : false

	//
	data.page_tag = "home"
	data.page_title = "THE HEIGHTS WELLNESS"
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

	const service_captcha = await getCaptcha(6, 2, false)
	data.service_captcha_image = service_captcha.captcha
	req.session.ying_service = service_captcha.key

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
		['en_name', 'name'],
		['en_job', 'job'],
		['en_desc', 'desc'],
		['en_fdesc', 'fdesc'],
		'email',
		'tel',
		'ext',
		'send_message_toggle',
		'email_tel_ext_toggle',
		'npi',
		'specialty',
		'license',
		'license_state',
		'license_start',
		'license_end',
		'dea',
		'dea_start',
		'dea_end',
		'img'
	] : [
		'id',
		['es_name', 'name'],
		['es_job', 'job'],
		['es_desc', 'desc'],
		['es_fdesc', 'fdesc'],
		'email',
		'tel',
		'ext',
		'send_message_toggle',
		'email_tel_ext_toggle',
		'npi',
		'specialty',
		'license',
		'license_state',
		'license_start',
		'license_end',
		'dea',
		'dea_start',
		'dea_end',
		'img'
	]
	const _doctors = await Doctor.findAll({ attributes: attributes, where: { status: 1 } })
	data.doctors = []
	_doctors.forEach(item => { data.doctors.push(item.dataValues) })

	attributes = siteLang === "en" ? [
		'id',
		['en_name', 'name'],
		['en_job', 'job'],
		['en_desc', 'desc'],
		['en_fdesc', 'fdesc'],
		'email',
		'tel',
		'ext',
		'email_tel_ext_toggle',
		'img'
	] : [
		'id',
		['es_name', 'name'],
		['es_job', 'job'],
		['es_desc', 'desc'],
		['es_fdesc', 'fdesc'],
		'email',
		'tel',
		'ext',
		'email_tel_ext_toggle',
		'img'
	]
	const _staffs = await Staff.findAll({ attributes: attributes, where: { status: 1 } })
	data.staffs = []
	_staffs.forEach(item => { data.staffs.push(item.dataValues) })

	attributes = siteLang === "en" ? [
		'id',
		['en_name', 'name'],
		['en_desc', 'desc'],
		'img'
	] : [
		'id',
		['es_name', 'name'],
		['es_desc', 'desc'],
		'img'
	]
	const _patient_reviews = await PatientReview.findAll({ attributes: attributes, where: { status: 1 } })
	data.patient_reviews = []
	_patient_reviews.forEach(item => { data.patient_reviews.push(item.dataValues) })

	attributes = siteLang === "en" ? [
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

	data.services = await ClinicService.findAll({ where: { home_page: 1, language: siteLang == "en" ? 17 : 25 }, order: [['order', 'ASC']] })

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
	}
	
	res.render('layout', data)
}

exports.getFile = async (req, res, next) => {
	const filepath = req.query.category ==="education" ? path.join(__dirname, "../public/assets/education", req.query.filename) : path.join(__dirname, "../public/assets/documents", req.query.filename)
	fs.access(filepath, fs.constants.F_OK | fs.constants.R_OK, (err) => {
		if (err) {
			return res.status(404).send("File not found or not readable!")
		} else {
			const getMimeType = filePath => {
				const mime = require('mime-types')
				return mime.lookup(filePath) || 'application/octet-stream'
			}

			res.setHeader('Content-Description', 'File Transfer')
			res.setHeader('Content-Type', getMimeType(filepath))
			res.setHeader('Content-Disposition', 'attachment; filename="' + path.basename(filepath) + '"')
			res.setHeader('Expires', 0)
			res.setHeader('Cache-Control', 'must-revalidate')
			res.setHeader('Pragma', 'public')
			res.setHeader('Content-Length', fs.statSync(filepath).size)

			const fileStream = fs.createReadStream(filepath)
			fileStream.pipe(res)
		}
	})

	return
}

exports.changeLanguage = async (req, res, next) => {
	req.session.language = req.body.language
	res.status(200).json({})
}

exports.changeCaptchaImage = async (req, res, next) => {

	const captcha = await getCaptcha(6, 2, false)
	
	if (req.body.type === "footer") {
		req.session.ying_footer = captcha.key
	} else if (req.body.type === "home") {
		req.session.ying = captcha.key
	} else if (req.body.type === "service") {
		req.session.ying_service = captcha.key
	} else if (req.body.type === "letter") {
		req.session.ying_letter = captcha.key
	}

	res.status(200).json({ image: captcha.captcha })
}

exports.submit = async (req, res, next) => {
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

	const name = req.body.contact_name
    const email = req.body.contact_email
    const cel = req.body.contact_cel
    const dob = req.body.contact_dob
    const captcha = req.body.contact_captcha

    const dobObj = new Date(dob)

	const type = req.body.contactusertype
	const reason= req.body.contactreason
	const subject = req.body.contact_subject
	const message = req.body.contact_message
	const lang = req.body.contact_lang
	const besttime = req.body.contact_time
	const patient_type = req.body.contactpttype
	const opt_status = req.body.opt_status

	if (req.session.ying === md5(md5(md5(captcha)))) {
		req.session.ying = null

		const staffs = await Staff.findAll({ where: { general_online: { [Op.or]: [1, 3] } } })
		const ptInfo = await PatientList.findOne({ where: { email: email } })

		const data = {
			clinic: contactInfo.name,
			type,
			patient_type,
			opt_status,
			reason,
			name,
			dob: dobObj,
			email,
			cel,
			subject,
			message,
			lang,
			best_time: besttime,
			pt_emr_id: ptInfo ? ptInfo.patient_id : 0,
			msg_type: 1, // 1 = General Message, 0 = Specific Message,
			m_seen: 0,
			m_delivered: 0,
			new_status: 1,
			pt_unread_count: 0,
			sf_unread_count: 0,

		}

		const newRecord = await FComContact.create({
			type: data.type,
			reason: data.reason,
			clinic_id: process.env.CLINIC_ID,
			pt_emr_id: data.pt_emr_id,
			name: data.name,
			email: data.email,
			cel: data.cel,
			dob: data.dob,
			subject: data.subject,
			opt_status: data.opt_status,
			message: data.message,
			date: new Date(Date.now()),
			assign: staffs.length ? staffs[0].id : "",
			priority: 1,
			status: 1,
			lang: data.lang,
			best_time: data.best_time,
			msg_type: data.msg_type,
			m_seen: data.m_seen,
			m_delivered: data.m_delivered,
			new_status: data.new_status,
			pt_unread_count: data.pt_unread_count,
			sf_unread_count: data.sf_unread_count
		})
		const last_id = newRecord.id
		let case_number = 0
		const last_case_number = await FComContact.findOne({ attributes: ["case_number"], order: [["case_number", "DESC"]] })
		if (last_case_number.case_number) {
			case_number = last_case_number.case_number + 1
		} else {
			case_number = 1
		}
		await FComContact.update({ case_number: case_number }, { where: { id: last_id } })

		// send to central begin //
		const centralData = {
			clinic: contactInfo.name,
			type: data.type,
			patient_type: patient_type,
			reason: data.reason,
			name: data.name,
			dob: data.dob,
			email: data.email,
			cel: data.cel,
			subject: data.subject,
			message: data.message,
			lang: data.lang,
			assign: staffs.length ? staffs[0].id : "",
			besttime: data.best_time,
			case_number: case_number
		}
		axios.post(process.env.CENTER_URL + "/api/sendContact", centralData).then(() => {
			console.log("OK")
		}).catch(err => {
			console.error(err)
		})
		// send to central end //

		// send email begin //
		const managers = await Managers.findAll()
		let emails = ""
		managers.forEach(item => {
			emails += item.email + ","
		})
		emails = emails.substr(0, emails.length - 1)
		staffs.forEach(item => {
			emails += "," + item.email
		})

		const emailSubject = "CASE # : " + case_number + acronym + " " + reason + " - Email From" + contactInfo.name

		const emailConfig = {
			site_url: process.env.SITE_URL,
			id: 0,
			acronym: acronym,
			title: "Email From" + contactInfo.name,
			reason: data.reason,
			name: data.name,
			email: data.email,
			cel: data.cel,
			dob: dobObj.toLocaleDateString(),
			subject: subject,
			message: data.message,
			besttime: data.best_time,
			opt_in: data.opt_status === 1 ? "Yes" : "No"
		}
		ejs.renderFile(path.join(__dirname, '../views/email/contactemail.ejs'), emailConfig, (error, data) => {
			if (error) {
				res.status(200).json({ status: "error", id: case_number })
			} else {
				const mailOptions = {
					from: process.env.MAIL_USERNAME,
					to: emails,
					subject: emailSubject,
					html: data
				}

				transporter.sendMail(mailOptions, (error, info) => {
					if (error) {
						console.error(err)
						res.status(200).json({ status: "error", id: case_number })
					} else {
						res.status(200).json({ status: "success", id: case_number })
					}
				})
			}
		})

		// send email end //
	} else {
		const captcha = await getCaptcha(6, 2, false)
		req.session.ying = captcha.key
		res.status(200).json({ status: "error", captcha: captcha.captcha, message: "captcha" })
	}
}

exports.submitSignUpForFooter = async (req, res, next) => {
	const contactInfo = await ContactInfo.findOne({ where: { id: 1 } })
	const acronym = contactInfo.acronym

	const emailAccountContent = await Translation.findAll({ where: { type: "template", keyvalue: { [Op.like]: "t_pa_ea_%" } } })
	const signupContent = await Translation.findAll({ where: { type: "template", keyvalue: { [Op.like]: "t_pa_su_%" } } })
	
	const { fname, lname, dob, email, phone, captcha } = req.body

	if (req.session.ying_footer === md5(md5(md5(captcha)))) {
		req.session.ying_footer = null

		const staffs = await Staff.findAll({ where: { account_request: { [Op.or]: [1, 3] } } })
		const ptInfo = await PatientList.findAll({ where: { email: email } })

		if (!ptInfo.length) {
			const data = {
				type: 1,
				opt_status: 1,
				reason: "Account Request",
				name: fname + " " + lname,
				sender: fname + " " + lname,
				dob: new Date(dob).toISOString().split('T')[0], // Date format: YYYY-MM-DD
				email: email,
				cel: phone,
				subject: "",
				message: "",
				lang: "en",
				best_time: "",
				pt_emr_id: 0,
				msg_type: 1,
				new_status: 1,
				m_seen: 0,
				m_delivered: 0,
				new_status: 0,
				pt_unread_count: 0,
				sf_unread_count: 0,
			}

			const newRecord = await FComContact.create({
				reason: data.reason,
				type: data.type,
				clinic_id: process.env.CLINIC_ID,
				pt_emr_id: data.pt_emr_id,
				name: data.name,
				sendeer: data.sender,
				email: data.email,
				cel: data.cel,
				dob: data.dob,
				subject: data.subject,
				opt_status: data.opt_status,
				message: data.message,
				date: new Date(Date.now()),
				sent: new Date(Date.now()),
				assign: staffs.length ? staffs[0].id : "",
				priority: 1,
				status: 1,
				lang: data.lang,
				best_time: data.best_time,
				msg_type: data.msg_type,
				m_seen: data.m_seen,
				m_delivered: data.m_delivered,
				new_status: data.new_status,
				pt_unread_count: data.pt_unread_count,
				sf_unread_count: data.sf_unread_count,
				date: data.date,
				sent: data.sent,
			})

			const last_id = newRecord.id
			let case_number = 0
			const last_case_number = FComContact.findOne({ attributes: ["case_number"], orer: [["case_number", "DESC"]] })
			if (last_case_number.case_number) {
				case_number = last_case_number.case_number + 1
			} else {
				case_number = 1
			}
			await FComContact.update({ case_number: case_number }, { where: { id: last_id } })

			// send to central begin //
			const centralData = {
				clinic: contactInfo.name,
				type: data.type,
				patient_type: patient_type,
				reason: data.reason,
				name: data.name,
				dob: data.dob,
				email: data.email,
				cel: data.cel,
				subject: data.subject,
				message: data.message,
				lang: data.lang,
				assign: staffs.length ? staffs[0].id : "",
				besttime: data.best_time,
				case_number: case_number
			}
			axios.post(process.env.CENTER_URL + "/api/sendContact", centralData).then(() => {
			console.log("OK")
			}).catch(err => {
				console.error(err)
			})
			// send to central end //

			// send email begin //
			const transporter = nodemailer.createTransport({
				host: process.env.MAIL_HOST,
				port: process.env.MAIL_PORT,
				secure: false,
				auth: {
					user: process.env.MAIL_USERNAME,
					pass: process.env.MAIL_PASSWORD,
				},
			})

			const managers = await Managers.findAll()
			let emails = ""
			managers.forEach(item => {
				emails += item.email + ","
			})
			emails = emails.substr(0, emails.length - 1)
			staffs.forEach(item => {
				emails += "," + item.email
			})

			const emailSubject = "CASE # : " + case_number + acronym + " " + process.env.SITE_URL + " - Pt Area Account Request" + contactInfo.name

			const emailConfig = {
				site_url: process.env.SITE_URL,
				id: case_number,
				acronym: acronym,
				fname: fname,
				lname: lname,
				email: data.email,
				phone: phone,
				dob: data.dob,
				email_header: req.session.language === "en" ? signupContent.en.t_pa_su_eheather : signupContent.es.t_pa_su_eheather,
				disclaimer: req.session.language === "en" ? emailAccountContent.en.t_pa_ea_disclaimer : emailAccountContent.es.t_pa_ea_disclaimer
			}
			ejs.renderFile(path.join(__dirname, '../views/email/accountemail.ejs'), emailConfig, (error, data) => {
				if (error) {
					res.status(200).json({ status: "error", id: case_number })
				} else {
					const mailOptions = {
						from: process.env.MAIL_USERNAME,
						to: emails,
						subject: emailSubject,
						html: data
					}

					transporter.sendMail(mailOptions, (error, info) => {
						if (error) {
							console.error(err)
							res.status(200).json({ status: "error", id: case_number })
						} else {
							res.status(200).json({ status: "success", id: case_number })
						}
					})
				}
			})
		} else {
			return res.status(200).json({ status: "warning", message: "exist" })
		}
	} else {
		const captcha = await getCaptcha(6, 2, false)
		req.session.ying_footer = captcha.key
		return res.status(200).json({ status: "error", captcha: captcha.captcha, message: "captcha" })
	}
}

// Terms of Use page
exports.renderTermsOfUse = async (req, res, next) => {
	let data = {}

	data.isLoggedIn = req.session.isLoggedIn ? req.session.isLoggedIn : false

	//
	data.page_tag = "privacy-policy"
	data.page_title = "THE HEIGHTS WELLNESS - Privacy Policy"
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
	}

	try {
		const response = await axios.post(process.env.CENTER_URL + "/api/privacy_policy", { lang: siteLang, clinic_id: process.env.CLINIC_ID })
		data.content_html = response.data.desc
		data.content_title = response.data.name

		// replace text name
		data.content_html = data.content_html.replace(/\$clinic_name/g, process.env.SITE_NAME) // clinic name
		data.content_html = data.content_html.replace(/\$contact_address/g, data.contact_info.address + ", " + data.contact_info.city + ", " + data.contact_info.state + " " + data.contact_info.zip) // clinic address
		data.content_html = data.content_html.replace(/\$contact_phone/g, data.contact_info.tel) // clinic phone
		data.content_html = data.content_html.replace(/\$contact_email/g, data.contact_info.email) // clinic phone
		data.content_html = data.content_html.replace(/\$last_updated_date/g, new Date(Date.now()).toLocaleDateString()) // clinic name
	} catch (error) {
		console.log(error.message)
	}
	res.render('layout', data)
}

// Privacy Policy page
exports.renderPrivacyPolicy = async (req, res, next) => {
	let data = {}

	data.isLoggedIn = req.session.isLoggedIn ? req.session.isLoggedIn : false

	//
	data.page_tag = "privacy-policy"
	data.page_title = "THE HEIGHTS WELLNESS - Privacy Policy"
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
	}

	try {
		const response = await axios.post(process.env.CENTER_URL + "/api/privacy_policy", { lang: siteLang, clinic_id: process.env.CLINIC_ID })
		data.content_html = response.data.desc
		data.content_title = response.data.name

		// replace text name
		data.content_html = data.content_html.replace(/\$clinic_name/g, process.env.SITE_NAME) // clinic name
		data.content_html = data.content_html.replace(/\$contact_address/g, data.contact_info.address + ", " + data.contact_info.city + ", " + data.contact_info.state + " " + data.contact_info.zip) // clinic address
		data.content_html = data.content_html.replace(/\$contact_phone/g, data.contact_info.tel) // clinic phone
		data.content_html = data.content_html.replace(/\$contact_email/g, data.contact_info.email) // clinic phone
		data.content_html = data.content_html.replace(/\$last_updated_date/g, new Date(Date.now()).toLocaleDateString()) // clinic name
	} catch (error) {
		console.log(error.message)
	}
	res.render('layout', data)
}
