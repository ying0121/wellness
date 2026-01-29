
const NewsletterData = require('../models/NewsletterData')
const NewsletterImage = require('../models/NewsletterImage')
const Translation = require('../models/Translation')
const ContactInfo = require('../models/ContactInfo')
const WorkingHour = require('../models/WorkingHour')
const AreaToggle = require('../models/AreaToggle')
const Meta = require('../models/Meta')
const AlertClinic = require('../models/AlertClinic')
const FVsLanguage = require('../models/FVsLanguage')
const PatientList = require('../models/PatientList')
const SystemInfo = require('../models/SystemInfo')

const { Op, Sequelize } = require('sequelize')

const { getCaptcha } = require('../utils/captcha')
const { generateQRCode } = require('../utils/qrcode')

exports.renderDetail = async (req, res, next) => {

    // get newsletter data
    const newsletterData = await NewsletterData.findOne({ attributes: {
		include: [
			[Sequelize.col("newsletterimages.image"), "image_url"]
		]
	}, include: [
		{
			model: NewsletterImage,
			as: "newsletterimages",
			attributes: [],
			required: false
		}
	], where: { view_url: req.params.id } })
    if (!newsletterData) {
        return res.redirect('/404')
    }

    let data = {}
	data.newsletter = newsletterData.dataValues

	// Generate QrCode
	let newsletter_qrcode_text = `${process.env.SITE_URL}/newsletter/${req.params.id} \n`
	data.newsletter_qrcode = await generateQRCode(newsletter_qrcode_text)

	const siteLang = req.session.language ? req.session.language : "es"
	data.isLoggedIn = req.session.isLoggedIn ? req.session.isLoggedIn : false

	const removeHtmlTag = (text) => {
		return text.replace(/<\/?[^>]+(>|$)/g, "").replace(/\s+/g, " ").trim()
	}

	//
	data.page_tag = "newsletter_detail"
	data.page_title = "Newsletter - " + (siteLang === "en" ? newsletterData.en_sub : newsletterData.es_sub)
	data.page_desc = removeHtmlTag(siteLang === "en" ? newsletterData.en_desc : newsletterData.es_desc)
	data.site_url = process.env.SITE_URL
	data.og_title = siteLang === "en" ? newsletterData.en_sub : newsletterData.es_sub
	data.og_desc = removeHtmlTag(siteLang === "en" ? newsletterData.en_desc : newsletterData.es_desc)
	data.twitter_title = siteLang === "en" ? newsletterData.en_sub : newsletterData.es_sub
	data.twitter_desc = removeHtmlTag(siteLang === "en" ? newsletterData.en_desc : newsletterData.es_desc)

	data.public_key = process.env.ENCRYPT_PUBLIC_KEY
	data.stripe_key = process.env.STRIPE_PUBLIC_KEY
    data.google_api_key = process.env.GOOGLE_API_KEY

	data.language = siteLang
	
	const captcha = await getCaptcha(6, 2, false)
	data.letter_captcha_image = captcha.captcha
	req.session.ying_letter = captcha.key

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

	const sysinfo = await SystemInfo.findAll()
	data.sysinfo = { month: sysinfo[0].value, year: sysinfo[1].value, work: sysinfo[2].value, word: sysinfo[3].value, language: sysinfo[4].value }

	data.meta = await Meta.findAll()

	data.acronym = data.contact_info.acronym

	const attributes = siteLang === "en" ? [
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
	
	res.render('layout', data)
}
