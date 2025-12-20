
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
const EducationDoc = require("../models/EducationDoc")
const EducationVideo = require("../models/EducationVideo")

const { getCaptcha } = require("../utils/captcha")
const { generateQRCode } = require("../utils/qrcode")

exports.render = async (req, res, next) => {
	let data = {}

	data.isLoggedIn = req.session.isLoggedIn ? req.session.isLoggedIn : false

	//
	data.page_tag = "educations"
	data.page_title = "THE HEIGHTS WELLNESS - Education" + (req.query.p ? (" - " + req.query.p.toUpperCase()) : "")
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

	let attributes = siteLang === "en" ? [
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

    data.page_type = req.query.p

    attributes = siteLang === "en" ? [
		'id',
		['title_en', 'title'],
        ['desc_en', 'desc'],
		['url_en', 'url'],
		'status'
	] : [
		'id',
		['title_es', 'title'],
        ['desc_es', 'desc'],
		['url_es', 'url'],
		'status'
	]
	const _docs = await EducationDoc.findAll({ attributes: attributes, where: { tag: data.page_type } })
	data.docs = []
	_docs.forEach(item => { data.docs.push(item.dataValues) })

    attributes = siteLang === "en" ? [
		'id',
		['title_en', 'title'],
		['url_en', 'url'],
		'status'
	] : [
		'id',
		['title_es', 'title'],
		['url_es', 'url'],
		'status'
	]
    const _videos = await EducationVideo.findAll({ attributes: attributes, where: { tag: data.page_type } })
	data.videos = []
	_videos.forEach(item => { data.videos.push(item.dataValues) })

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