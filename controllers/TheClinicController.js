
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

const { getCaptcha } = require("../utils/captcha")
const { generateQRCode } = require("../utils/qrcode")

exports.render = async (req, res, next) => {
	let data = {}

	data.isLoggedIn = req.session.isLoggedIn ? req.session.isLoggedIn : false

	// 
	data.page_tag = "the-clinic"
	data.page_title = "THE HEIGHTS WELLNESS - The Clinic"
	data.page_desc = "The Heights Wellness Medical Service"
	data.site_url = process.env.SITE_URL
	data.og_title = "The Heights Wellness"
	data.og_desc = "The Heights Wellness Medical Service"
	data.twitter_title = "The Heights Wellness"
	data.twitter_desc = "The Heights Wellness Medical Service"
	
	data.public_key = process.env.ENCRYPT_PUBLIC_KEY
	data.stripe_key = process.env.STRIPE_PUBLIC_KEY
    data.google_api_key = process.env.GOOGLE_API_KEY

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
	console.log(data.area_toggle)

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
	const _header_banner = await PageImg.findAll({ attributes: attributes, where: { status: 1, page: "TheClinic", position: "HEADER-BANNER" } })
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

	data.services = await ClinicService.findAll({ where: { home_page: 1, language: siteLang == "en" ? 17 : 25 } })

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