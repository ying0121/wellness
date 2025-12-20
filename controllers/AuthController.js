
const md5 = require("md5")
const path = require("path")
const nodemailer = require("nodemailer")
const ejs = require("ejs")
const axios = require("axios")

const { Op } = require("sequelize")

const Translation = require("../models/Translation")
const ContactInfo = require("../models/ContactInfo")
const WorkingHour = require("../models/WorkingHour")
const AreaToggle = require("../models/AreaToggle")
const Meta = require("../models/Meta")
const SystemInfo = require("../models/SystemInfo")
const AlertClinic = require("../models/AlertClinic")
const FVsLanguage = require("../models/FVsLanguage")
const PatientList = require("../models/PatientList")
const UserSecurity = require("../models/UserSecurity")
const SQuestion = require("../models/SQuestion")
const Setting = require("../models/Setting")
const Staff = require("../models/Staff")
const ContactEmail = require("../models/ContactEmail")
const FComContact = require("../models/FComContact")
const Verify = require("../models/Verify")

const { getCaptcha } = require("../utils/captcha")
const { generateQRCode, saveQRode } = require("../utils/qrcode")

const transporter = nodemailer.createTransport({
	host: process.env.MAIL_HOST,
	port: process.env.MAIL_PORT,
	secure: false,
	auth: {
		user: process.env.MAIL_USERNAME,
		pass: process.env.MAIL_PASSWORD,
	},
})

// sign in page
exports.signin = async (req, res, next) => {
    let data = {}

	data.isLoggedIn = req.session.isLoggedIn ? req.session.isLoggedIn : false

	//
	data.page_tag = "auth/signin"
	data.page_title = "THE HEIGHTS WELLNESS - Sign In"
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

	res.render('layout', data)
}
// security page
exports.security = async (req, res, next) => {
	let data = {}

	data.isLoggedIn = req.session.isLoggedIn ? req.session.isLoggedIn : false

	//
	data.page_tag = "auth/security"
	data.page_title = "THE HEIGHTS WELLNESS - Security"
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
	data.patient_name = ""

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

	data.question = req.session.question ? req.session.question : ""

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

	if (!req.session.question) {
		res.redirect("login")
	} else {
		res.render('layout', data)
	}
}
// sign up page
exports.signup = async (req, res, next) => {
	let data = {}

	data.isLoggedIn = req.session.isLoggedIn ? req.session.isLoggedIn : false

	//
	data.page_tag = "auth/signup"
	data.page_title = "THE HEIGHTS WELLNESS - Sign Up"
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
	
	const captcha = await getCaptcha(6, 0, true)
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

    data.signupresult = ""

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

	res.render('layout', data)
}
// help page
exports.help = async (req, res, next) => {
	let data = {}

	data.isLoggedIn = req.session.isLoggedIn ? req.session.isLoggedIn : false

	//
	data.page_tag = "auth/help"
	data.page_title = "THE HEIGHTS WELLNESS - Help"
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
	
	const captcha = await getCaptcha(6, 0, true)
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

	res.render('layout', data)
}
// verify page
exports.verify = async (req, res, next) => {
	const verify_url = req.params.verify_url
	const verify_info = verify_url.split("-")
	if (verify_info.length === 3 && verify_info[0] === "verify" && verify_info[1].length === 32) {
		// check if the verify link is valid
		const expiredDate = new Date(Date.now())
		expiredDate.setDate(expiredDate.getDate() - 1)
		const links = await Verify.findOne({ where: { patient_id: verify_info[2], link: "verify-" + verify_info[1], create_time: { [Op.gt]: expiredDate } } })

		if (links) { // valid link
			let data = {}

			data.isLoggedIn = req.session.isLoggedIn ? req.session.isLoggedIn : false

			//
			data.page_tag = "auth/verify"
			data.page_title = "THE HEIGHTS WELLNESS - Verify"
			data.page_desc = "The Heights Wellness Medical Service"
			data.site_url = process.env.SITE_URL
			data.og_title = "The Heights Wellness"
			data.og_desc = "The Heights Wellness Medical Service"
			data.twitter_title = "The Heights Wellness"
			data.twitter_desc = "The Heights Wellness Medical Service"

			data.v = verify_url

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

			if (req.session.patient_id) {
				data.patient_info = await PatientList.findOne({ where: { id: req.session.patient_id } })
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

			return res.render('layout', data)
		} else { // invlid link
			return res.render("404")
		}
	} else {
		return res.render("404")
	}
}
// log out
exports.signout = async (req, res, next) => {
	req.session.isLoggedIn = false
	req.session.patient_id = null

	res.redirect("login")
}


exports.confirmSignIn = async (req, res, next) => {
	const name = req.body.name
	const password = req.body.password

	// get available patient information
	const patient_info = await PatientList.findOne({ where: { [Op.or]: [{ email: name }, { id: name }, { phone: name }] } })

	// get error messages
	const _m = await Translation.findAll({ where: { type: "template", keyvalue: { [Op.like]: "t_pa_lf_%" } } })
	let messages = { en: [], es: [] }
	_m.forEach(item => {
		messages.en[item.keyvalue] = item.en
		messages.es[item.keyvalue] = item.es
	})

	if (patient_info) { // existed
		if (patient_info.password === md5(password)) { // correct password
			req.session.patient_id = patient_info.id

			if (patient_info.status === 1) { // actived account
				await PatientList.update({ login_count: 0 }, { where: { id: patient_info.id } }) // set login count as 0

				// check security authentication if patient set this
				const securities = await UserSecurity.findAll({ where: { user_id: patient_info.id, user_type: "patient" } })
				
				if (securities.length > 0) { // existed securities
					const index = Math.floor(Math.random() * (securities.length - 1)) // generate random index for question
					const question = await SQuestion.findOne({ where: { id: securities[index].question_id } })

					// save the answer of the selected question in session
					req.session.question = { en: question.en, es: question.es }
					req.session.answer = securities[index].answer

					res.status(200).json({ status: "success", url: "./security" })
				} else { // not existed securities, so the patient can go to vault directly
					// set some information to session
					req.session.isLoggedIn = true
					res.status(200).json({ status: "success", url: "./vault" })
				}
			} else { // inactived account
				res.status(200).json({ status: "warning", error_message: req.session.language === "en" ? messages.en["t_pa_lf_inactive"] : messages.es["t_pa_lf_inactive"] })
			}
		} else { // wrong password
			const failed_limit = await Setting.findOne({ where: { type: "failed_limit" } })
			const login_count = patient_info.login_count + 1 // increase login count

			if (login_count >= failed_limit.value) { // over login count, so the patient's account will be inactived
				await PatientList.update({ status: 0 }, { where: { id: patient_info.id } }) // make the account be inactived
				await PatientList.update({ login_count: 0 }, { where: { id: patient_info.id } }) // set login count as 0
			} else {
				await PatientList.update({ login_count: login_count }, { where: { id: patient_info.id } }) // set login count as 0
			}

			res.status(200).json({ status: "warning", error_message: req.session.language === "en" ? messages.en["t_pa_lf_text"] + (failed_limit.value - login_count) : messages.es["t_pa_lf_text"] + (failed_limit.value - login_count) })
		}
	} else { // not existed
		res.status(200).json({ status: "warning", error_message: req.session.language === "en" ? messages.en["t_pa_lf_failed"] : messages.es["t_pa_lf_failed"] })
	}
}
exports.confirmSecurity = async (req, res, next) => {
	const answer = req.body.answer
	if (req.session.answer === md5(answer)) { // correct answer
		req.session.isLoggedIn = true

		res.status(200).json({ url: "./vault" })
	} else { // wrong answer
		req.session.isLoggedIn = false
		req.session.patient_id = null

		res.status(200).json({ url: "./login" })
	}
}
exports.confirmSignUp = async (req, res, next) => {
	// get error messages
	const _m = await Translation.findAll()
	let messages = { en: [], es: [] }
	_m.forEach(item => {
		messages.en[item.keyvalue] = item.en
		messages.es[item.keyvalue] = item.es
	})

	const captcha = req.body.captcha
	if (req.session.ying === md5(md5(md5(captcha)))) { // correct captcha
		// get signup information
		const fname = req.body.first_name
		const lname = req.body.last_name
		const dob = req.body.dob
		const email = req.body.email
		const phone = req.body.phone

		const patientInfo = await PatientList.findOne({ where: { email: email } })
		if (patientInfo) { // already existed patient information
			return res.status(200).json({ status: "error", error_message: req.session.language === "en" ? messages.en["t_pa_su_alert_exist"] : messages.es["t_pa_su_alert_exist"] })
		} else {
			const staffs = await Staff.findAll({ where: { account_request: { [Op.or]: [1, 3] } } })

			// add to contact table
			const newRecord = await FComContact.create({
				name: fname + " " + lname,
				sender: fname + " " + lname,
				dob: dob,
				email: email,
				cel: phone,
				reason: "Account Request",
				type: 1,
				pt_emr_id: 0,
				clinic_id: process.env.CLINIC_ID,
				date: new Date(Date.now()),
				sent: new Date(Date.now()),
				lang: req.session.lanuage,
				status: 1,
				priority: 1,
				assign: staffs[0].id ? staffs[0].id : 0,
				new_status: 1,
				pt_unread_count: 0,
				sf_unread_count: 0,
				msg_type: 1, // 1 = General Message, 0 = Specific Message,
				m_seen: 0,
				m_delivered: 0,
			})

			// get case number
			const last_id = newRecord.id
			let case_number = 0
			const last_case_number = await FComContact.findOne({ attributes: ["case_number"], order: [["case_number", "DESC"]] })
			if (last_case_number.case_number) {
				case_number = last_case_number.case_number + 1
			} else {
				case_number = 1
			}
			await FComContact.update({ case_number: case_number }, { where: { id: last_id } })

			// get contact information
			const contactInfoes = await ContactInfo.findOne({ id: 1 })
			const acronym = contactInfoes.acronym

			// send to central begin //

			const centralData = {
				clinic: contactInfoes.name,
				type: 1,
				patient_type: 1,
				reason: "Account Request",
				name: fname + " " + lname,
				dob: dob,
				email: email,
				cel: phone,
				subject: "",
				message: "",
				lang: req.session.language,
				assign: staffs.length ? staffs[0].id : "",
				besttime: "Anytime",
				case_number: case_number
			}
			axios.post(process.env.CENTER_URL + "/api/sendContact", centralData).then(() => {
				console.log("OK")
			}).catch(err => {
				console.error(err)
			})
			// send to central end //

			// send email begin //
			const _e = await ContactEmail.findAll({ attributes: ["email"], where: { account_request: 1 } })
			let emails = ""
			_e.forEach(item => {
				emails += item.email + ","
			})
			emails = emails.substr(0, emails.length - 1)

			const emailSubject = "CASE # : " + case_number + acronym + " " + process.env.SITE_URL + " - PT Area Account Request"

			const emailConfig = {
				site_url: process.env.SITE_URL,
				id: case_number,
				acronym: acronym,
				fname: fname,
				lname: lname,
				email: email,
				phone: phone,
				dob: new Date(dob).toLocaleDateString(),
				email_header: req.session.language === "en" ? messages.en.t_pa_su_eheader : messages.es.t_pa_su_eheader,
				disclaimer: req.session.language === "en" ? messages.en.t_pa_ea_disclaimer : messages.es.t_pa_ea_disclaimer
			}
			ejs.renderFile(path.join(__dirname, '../views/email/accountemail.ejs'), emailConfig, (error, data) => {
				if (error) {
					res.status(200).json({ status: "error", id: case_number })
				} else {
					const mailOptions = {
						from: process.env.MAIL_USERNAME,
						to: emails,
						subject: emailSubject,
						html: htmlContents
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
		}
	} else { // wrong captcha
		const captcha = await getCaptcha(6, 2, false)
		req.session.ying = captcha.key

		return res.status(200).json({ status: "error", captcha: captcha.captcha, error: "captcha", error_message: req.session.language === "en" ? messages.en["c_alert_incorrect_captcha"] : messages.es["c_alert_incorrect_captcha"] })
	}

}
exports.confirmHelp = async (req, res, next) => {
	// get all messages
	const _m = await Translation.findAll()
	let messages = { en: [], es: [] }
	_m.forEach(item => {
		messages.en[item.keyvalue] = item.en
		messages.es[item.keyvalue] = item.es
	})
	// get clinic information
	const clinicInfo = await ContactInfo.findOne({ where: { id: 1 } })

	const help = req.body.help_type
	if (help === "account") { // forgot account
		const fname = req.body.first_name
		const lname = req.body.last_name
		const dob = req.body.dob

		const _e = await Translation.findAll({ where: { type: "template", keyvalue: { [Op.like]: "t_pa_ea_%" } } })
		let body = { en: [], es: [] }
		_e.forEach(item => {
			body.en[item.keyvalue] = item.en
			body.es[item.keyvalue] = item.es
		})

		// get patient info
		const patientInfo = await PatientList.findOne({ where: { fname: fname, lname: lname, dob: dob } })
		if (patientInfo) { // existed patient
			// send email begin //
			const emailSubject = process.env.SITE_URL + " - "

			const emailConfig = {
				site_url: process.env.SITE_URL,
				acronym: clinicInfo.acronym,
				clinic_info: clinicInfo,
				body: body,
				from_email: process.env.SITE_URL,
				patient_id: patientInfo.id,
				patient_fname: fname,
				patient_language: patientInfo.language,
				contact_url: process.env.SITE_URL + "/login",
				contact_email: "roswellg@gmail.com,blockchainstar0713@gmail.com",
			}
			ejs.renderFile(path.join(__dirname, '../views/email/helpemail.ejs'), emailConfig, (error, data) => {
				if (error) {
					return res.status(200).json({ status: "warning", error: "invalid", error_message: req.session.language === "en" ? messages.en["t_pa_ah_alert_notexisted"] : messages.es["t_pa_ah_alert_notexisted"] })
				} else {
					const mailOptions = {
						from: process.env.MAIL_USERNAME,
						to: patientInfo.email,
						subject: emailSubject,
						html: data
					}

					transporter.sendMail(mailOptions, (error, info) => {
						if (error) {
							console.error(err)
							return res.status(200).json({ status: "warning", error: "invalid", error_message: req.session.language === "en" ? messages.en["t_pa_ah_alert_notexisted"] : messages.es["t_pa_ah_alert_notexisted"] })
						} else {
							return res.status(200).json({ status: "success", url: process.env.SITE_URL + "/login" })
						}
					})
				}
			})
			// send email end //
		} else { // not existed patient
			return res.status(200).json({ status: "warning", error: "invalid", error_message: req.session.language === "en" ? messages.en["t_pa_ah_alert_notexisted"] : messages.es["t_pa_ah_alert_notexisted"] })
		}
	} else if (help === "password") { // forgot password
		const email = req.body.email
		const captcha = req.body.captcha

		if (req.session.ying === md5(md5(md5(captcha)))) { // correct captcha
			const patientInfo = await PatientList.findOne({ where: { email: email } })

			if (patientInfo) { // existed patient
				// generate verify url
				const characters = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
				let verifyUrl = "verify-"
				for (let i =0; i < 32; i ++) {
					verifyUrl += characters.charAt(Math.floor(Math.random() * characters.length))
				}

				// QR Code Begin //
				let qrcode_text = `NAME : ${patientInfo.fname + " " + patientInfo.lname} \n`
				qrcode_text += `EMAIL : ${patientInfo.email} \n`
				qrcode_text += `VERIFY URL : ${process.env.SITE_URL}/${verifyUrl}-${patientInfo.id}`

				await saveQRode(qrcode_text, "./public/assets/images/common/qrcode.png")
				// QR Code End //

				const _e = await Translation.findAll({ where: { type: "template", keyvalue: { [Op.like]: "t_pa_ep_%" } } })
				let body = { en: [], es: [] }
				_e.forEach(item => {
					body.en[item.keyvalue] = item.en
					body.es[item.keyvalue] = item.es
				})

				// send email begin //
				const emailSubject = process.env.SITE_URL + " - " + req.session.language === "en" ? body.en.t_pa_ep_subject : body.es.t_pa_ep_subject

				const emailConfig = {
					site_url: process.env.SITE_URL,
					acronym: clinicInfo.acronym,
					body: body,
					link: process.env.SITE_URL + "/" + this.verifyUrl + "-" + patientInfo.id,
					patient_id: patientInfo.id,
					patient_fname: patientInfo.fname,
					disclaimer: {
						en: messages.en.t_pa_ea_disclaimer,
						es: messages.es.t_pa_ea_disclaimer
					},
					qrcode: process.env.SITE_URL + "/assets/images/common/qrcode.png",
				}
				ejs.renderFile(path.join(__dirname, '../views/email/passwordemail.ejs'), emailConfig, (error, data) => {
					if (error) {
						res.status(200).json({ status: "error", id: case_number })
					} else {
						const mailOptions = {
							from: process.env.MAIL_USERNAME,
							to: email,
							subject: emailSubject,
							html: data
						}
		
						transporter.sendMail(mailOptions, (error, info) => {})
					}
				})
				// send email end //

				// save the key to verify table
				const oldVerify = await Verify.findOne({ where: { email: email, patient_id: patientInfo.id } })
				if (oldVerify) {
					await Verify.destroy({ where: { id: oldVerify.id } })
				}
				await Verify.create({
					email: email,
					patient_id: patientInfo.id,
					link: verifyUrl,
					create_time: new Date(Date.now())
				})

				return res.status(200).json({ status: "success", url: "login" })
			} else { // not existed patient
				return res.status(200).json({ status: "warning", error: "invalid", error_message: req.session.language === "en" ? messages.en["t_pa_ah_alert_notexisted"] : messages.es["t_pa_ah_alert_notexisted"] })
			}
		} else { // wrong captcha
			const captcha = await getCaptcha(6, 0, true)
			req.session.ying = captcha.key

			return res.status(200).json({ status: "error", captcha: captcha.captcha, error: "captcha", error_message: req.session.language === "en" ? messages.en["c_alert_incorrect_captcha"] : messages.es["c_alert_incorrect_captcha"] })
		}
	}
}
exports.confirmVerify = async (req, res, next) => {
	const verify_info = req.body.v.split("-")
	const password = req.body.password

	// check if the verify link is valid
	const expiredDate = new Date(Date.now())
	expiredDate.setDate(expiredDate.getDate() - 1)
	const links = await Verify.findOne({ where: { patient_id: verify_info[2], link: "verify-" + verify_info[1], create_time: { [Op.gt]: expiredDate } } })
	
	if (links) {
		// delete the verify link
		await Verify.destroy({ where: { link: "verify-" + verify_info[1] } })

		// reset password
		await PatientList.update({ password: md5(password) }, { where: { id: verify_info[2] } })

		return res.status(200).json({ status: "success" })
	} else {
		// get all messages
		const _m = await Translation.findAll()
		let messages = { en: [], es: [] }
		_m.forEach(item => {
			messages.en[item.keyvalue] = item.en
			messages.es[item.keyvalue] = item.es
		})

		return res.status(200).json({ status: "warning", error: "invalid", error_message: req.session.language === "en" ? messages.en.c_pwd_invalid_url : messages.es.c_pwd_invalid_url })
	}
}
