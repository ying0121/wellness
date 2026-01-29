
const fs = require("fs")
const path = require("path")
const ejs = require("ejs")
const twilio = require("twilio")
const nodemailer = require("nodemailer")

const { generateRandomString } = require("../../utils/func")

const AreaToggle = require("../../models/AreaToggle")
const Translation = require("../../models/Translation")
const ContactInfo = require("../../models/ContactInfo")

const NewsletterImage = require("../../models/NewsletterImage")
const NewsletterData = require("../../models/NewsletterData")
const MedCondition = require("../../models/MedCondition")
const PatientList = require("../../models/PatientList")
const EducationDoc = require("../../models/EducationDoc")
const EducationVideo = require("../../models/EducationVideo")
const EducationTag = require("../../models/EducationTag")

const { Sequelize, QueryTypes, Op } = require('sequelize')

const transporter = nodemailer.createTransport({
	host: process.env.MAIL_HOST,
	port: process.env.MAIL_PORT,
	secure: false,
	pool: true,
	auth: {
		user: process.env.MAIL_USERNAME,
		pass: process.env.MAIL_PASSWORD,
	},
})

exports.render = async (req, res, next) => {
	let data = {}

	data.sideItem = "newsletter"
	data.site_url = process.env.SITE_URL
	data.prefix = process.env.PREFIX_URL
	data.menus = req.session.adminUser.access_rights
	data.userType = req.session.adminUser.type
	data.loginTime = req.session.loginTime
	data.expiredTime = req.session.expiredTime
	data.userFullName = req.session.adminUser.fname + " " + req.session.adminUser.lname

	data.images = await NewsletterImage.findAll()

	const _a = await AreaToggle.findAll()
	data.area_toggle = {}
	_a.forEach(item => { data.area_toggle[item.area_id] = item.status })

	const _t = await Translation.findAll()
	data.component= []
	_t.forEach(item => { data.component[item.keyvalue] = [], data.component[item.keyvalue].en = item.en, data.component[item.keyvalue].es = item.es })

	data.contact_info = await ContactInfo.findOne({ where: { id: 1 } })
	
	res.render('admin/newsletters', data)
}
exports.renderView = async (req, res, next) => {
	let data = {}

	data.sideItem = "newsletter"
	data.site_url = process.env.SITE_URL
	data.prefix = process.env.PREFIX_URL
	data.menus = req.session.adminUser.access_rights
	data.userType = req.session.adminUser.type
	data.loginTime = req.session.loginTime
	data.expiredTime = req.session.expiredTime
	data.userFullName = req.session.adminUser.fname + " " + req.session.adminUser.lname

	data.contact_info = await ContactInfo.findOne({ where: { id: 1 } })

	const _a = await AreaToggle.findAll()
	data.area_toggle = {}
	_a.forEach(item => { data.area_toggle[item.area_id] = item.status })

	const _t = await Translation.findAll()
	data.component= []
	_t.forEach(item => { data.component[item.keyvalue] = [], data.component[item.keyvalue].en = item.en, data.component[item.keyvalue].es = item.es })

	const id = req.query.id
	data.newsletter_data = await NewsletterData.findOne({ where: { id: id }, row: true })
	data.med_conditions = await MedCondition.findAll({ row: true })

	res.render('admin/view_newsletter', data)
}

exports.getImage = async (req, res, next) => {
	const images = await NewsletterImage.findAll()
	res.status(200).json({ data: images })
}
exports.deleteImage = async (req, res, next) => {
	const id = req.body.id
	const theData = await NewsletterImage.findOne({ where: { id } })
	if (theData && theData.image) {
		// delete image at first
		fs.unlink(path.join(__dirname, '../../public/assets/images/newsimg/', theData.image), (err) => { })
	}

	await theData.destroy()

	res.status(200).json({ status: "success" })
}

exports.getData = async (req, res, next) => {
	const data = await NewsletterData.findAll({ order: [['published', 'DESC']] })

	res.status(200).json({ data: data })
}

exports.addData = async (req, res, next) => {
	const entry = {
		en_sub: req.body.en_sub,
		es_sub: req.body.es_sub,
		author: req.body.author,
		published: req.body.date,
		link: req.body.link,
		view_url: req.body.view_url,
		status: 1
	}

	// make a link
	if (!entry.link) {
		entry.link = await generateRandomString(8)
	}
	if (!entry.view_url) {
		entry.view_url = await generateRandomString(8)
	}

	// get data by link
	const dataByLink = await NewsletterData.findOne({ where: { link: entry.link } })
	// get data by view url
	const dataByViewUrl = await NewsletterData.findOne({ where: { view_url: entry.view_url } })

	if (dataByLink || dataByViewUrl) {
		return res.status(200).json({ status: "existed" })
	} else {
		await NewsletterData.create(entry)

		return res.status(200).json({ status: "success" })
	}
}

exports.updateData = async (req, res, next) => {
	const id = req.body.id
	const params = {
		en_sub: req.body.en_sub,
		es_sub: req.body.es_sub,
		author: req.body.author,
		view_url: req.body.view_url,
		med_cond: req.body.med_cond,
		published: req.body.date,
		link: req.body.link,
		education_material: req.body.education_material,
		gender: req.body.gender,
		age_all: req.body.age_all,
		show_contact: req.body.show_contact,
		age_from: req.body.age_from,
		age_to: req.body.age_to,
		en_desc: req.body.en_desc,
		es_desc: req.body.es_desc
	}

	if (params.age_all !== 1 && parseInt(params.age_from) > parseInt(params.age_to)) {
		return res.status(200).json({ status: "age" })
	}

	const theDataByLink = await NewsletterData.findOne({ where: { link: params.link } })
	if (theDataByLink && theDataByLink.id != id) {
		return res.status(200).json({ status: "existed" })
	}

	const theDataByViewUrl = await NewsletterData.findOne({ where: { view_url: params.view_url } })
	if (theDataByViewUrl && theDataByViewUrl.id != id) {
		return res.status(200).json({ status: "existed" })
	}

	const theData = await NewsletterData.findOne({ where: { id: id } })
	theData.update(params)

	res.status(200).json({ status: "success" })
}

exports.deleteData = async (req, res, next) => {
	const id = req.body.id

	NewsletterData.destroy({ where: { id } })

	res.status(200).json({ status: "success" })
}

exports.setDataImage = async (req, res, next) => {
	const id = req.body.id
	const image = req.body.image

	NewsletterData.update({ image: image }, { where: { id: id } })

	return res.status(200).json({ status: "success" })
}

exports.sendDataEmailMonth = async (req, res, next) => {
	const id = req.body.id
	const language = req.body.lang == 1 ? "en" : "es"
	const all = req.body.all
	const apt_months = req.body.apt_months

	let emailList = []

	// get patient email with med cond
	if (all == 1) { // all prop is true
		const theNewsletter = await NewsletterData.findOne({ attributes: ["med_cond", "gender", "age_all", "age_from", "age_to"], where: { id: id } })
		const medCondIDArray = JSON.parse(theNewsletter.med_cond || "[]")
		
		// get medication conditions
		let medCondData = ""
		for (let i = 0; i < medCondIDArray.length; i ++) {
			const theMedCondition = await MedCondition.findAll({ area_toggle: ["id", "codes"], where: { id: medCondIDArray[i] } })
			if (theMedCondition) {
				medCondData ? (medCondData += theMedCondition.codes) : (medCondData += "," + theMedCondition.codes)
			}
		}

		// Gender condition
		let genderCondition = {};
		if (theNewsletter.gender == 1) genderCondition = { gender: "Male" }
		else if (theNewsletter.gender == 2) genderCondition = { gender: "Female" }

		// Age condition
		let ageCondition = {}
		let startDate = null, endDate = null

		if (theNewsletter.age_all == 0) {
			const currentYear = new Date().getFullYear()
			startDate = `${currentYear - theNewsletter.age_to}-01-01`
			endDate   = `${currentYear - theNewsletter.age_from + 1}-01-01`

			ageCondition = { dob: { [Op.between]: [startDate, endDate] } }
		}

		if (!medCondData) {
			emailList = await PatientList.findAll({ attributes: ["patient_id", "email"], where: { email: { [Op.ne]: "" }, ...genderCondition, ...ageCondition } })
		} else {
			const query = `SELECT patient_id, email FROM (
							   SELECT  patient_list.patient_id, patient_list.email, patient_list.gender, patient_list.dob, asmtlog.asmtId, icdlog.icd_id, INSTR("${medCondData}", icdlog.icd_id) AS found 
							   FROM patient_list 
							   INNER JOIN asmtlog ON patient_list.patient_id = asmtlog.patientId 
							   INNER JOIN icdlog ON asmtlog.asmtId = icdlog.asmtId 
						   ) AS b 
						   WHERE b.found <> 0 AND email <> '' AND gender_condition = "${genderCondition.gender}" AND dob BETWEEN "${startDate}" AND "${endDate}" 
						   GROUP BY patient_id`
			emailList = await Sequelize.query(query, { type: QueryTypes.SELECT })
		}
	}

	const contactInfo = await ContactInfo.findOne({ where: { id: 1 } })

	// get chosen newsletter
	let attributes = [
		language == "en" ? ["en_sub", "header"] : ["es_sub", "header"],
		language == "en" ? ["en_desc", "desc"] : ["es_desc", "desc"],
		"author",
		"published",
		"show_contact",
		[Sequelize.col("newsletterimages.image"), "image"]
	]
	const theNewsLetter = await NewsletterData.findOne({ attributes, where: { id: id }, include: [{ model: NewsletterImage, attributes: [] }], row: true })

	// get education material urls from newsletter
	let docResultData = []
	let videoResultData = []

	// 1. Get edu_material from newsletterdata
	const newsletter = await NewsletterData.findOne({
		where: { id: id },
		attributes: ["edu_material"],
		raw: true
	})

	const eduMatArrayString = newsletter.edu_material

	if (eduMatArrayString) {
		const eduMatIDArray = JSON.parse(eduMatArrayString);

		for (const item of eduMatIDArray) {
			const [type, id] = item.split("_")
			// 2. Documents
			if (type === "doc") {
				attributes = lang === "en" ? [
					"id",
					["en_title", "name"],
					["en_desc", "desc"],
					["en_doc", "doc"]
				] : [
					"id",
					["es_title", "name"],
					["es_desc", "desc"],
					["es_doc", "doc"]
				]

				const docs = await EducationDoc.findAll({ where: { id }, attributes, raw: true })

				docs.forEach(doc => {
					docResultData.push({
						name: doc.name,
						desc: doc.desc,
						url: doc.doc
					})
				})
			}

			// 3. Videos
			if (type === "video") {
				attributes = lang === "en" ? [["en", "url"]] : [["es", "url"]]

				const videos = await EducationVideo.findAll({ where: { id }, attributes, raw: true })

				videos.forEach(v => {
					videoResultData.push({
						url: v.url
					})
				})
			}
		}
	}

	// send email begin //
	const emailSubject = "Newsletter Email From " + contactInfo.email

	let emails = ""
	emailList.forEach(item => {
		emails ? (emails += item.email) : (emails += "," + item.email)
	})

	const emailConfig = {
		site_url: process.env.SITE_URL,
		prefix: process.env.PREFIX_URL,
		title: "Email From" + contactInfo.name,
		data: theNewsLetter,
		edu_data: {
			docs: docResultData,
			videos: videoResultData
		}
	}
	
	ejs.renderFile(path.join(__dirname, '../../views/email/newsletter.ejs'), emailConfig, (error, data) => {
		if (error) {
			res.status(200).json({ status: "error" })
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
					return res.status(200).json({ status: "error" })
				} else {
					return res.status(200).json({ status: "success" })
				}
			})
		}
	})
	// send email end //
}

exports.sendDataSMSMonth = async (req, res, next) => {
	const id = req.body.id
	const language = req.body.lang == 1 ? "en" : "es"
	const all = req.body.all
	const apt_months = req.body.apt_months

	let mobileList = []

	// get patient mobile with med cond
	if (all == 1) { // all prop is true
		const theNewsletter = await NewsletterData.findOne({ attributes: ["med_cond", "gender", "age_all", "age_from", "age_to"], where: { id: id } })
		const medCondIDArray = JSON.parse(theNewsletter.med_cond || "[]")
		
		// get medication conditions
		let medCondData = ""
		for (let i = 0; i < medCondIDArray.length; i ++) {
			const theMedCondition = await MedCondition.findAll({ area_toggle: ["id", "codes"], where: { id: medCondIDArray[i] } })
			if (theMedCondition) {
				medCondData ? (medCondData += theMedCondition.codes) : (medCondData += "," + theMedCondition.codes)
			}
		}

		// Gender condition
		let genderCondition = {};
		if (theNewsletter.gender == 1) genderCondition = { gender: "Male" }
		else if (theNewsletter.gender == 2) genderCondition = { gender: "Female" }

		// Age condition
		let ageCondition = {}
		let startDate = null, endDate = null

		if (theNewsletter.age_all == 0) {
			const currentYear = new Date().getFullYear()
			startDate = `${currentYear - theNewsletter.age_to}-01-01`
			endDate   = `${currentYear - theNewsletter.age_from + 1}-01-01`

			ageCondition = { dob: { [Op.between]: [startDate, endDate] } }
		}

		if (!medCondData) {
			mobileList = await PatientList.findAll({ attributes: ["patient_id", "mobile"], where: { mobile: { [Op.ne]: "" }, ...genderCondition, ...ageCondition } })
		} else {
			const query = `SELECT patient_id, mobile FROM (
							   SELECT  patient_list.patient_id, patient_list.mobile, patient_list.gender, patient_list.dob, asmtlog.asmtId, icdlog.icd_id, INSTR("${medCondData}", icdlog.icd_id) AS found 
							   FROM patient_list 
							   INNER JOIN asmtlog ON patient_list.patient_id = asmtlog.patientId 
							   INNER JOIN icdlog ON asmtlog.asmtId = icdlog.asmtId 
						   ) AS b 
						   WHERE b.found <> 0 AND mobile <> '' AND gender_condition = "${genderCondition.gender}" AND dob BETWEEN "${startDate}" AND "${endDate}" 
						   GROUP BY patient_id`
			mobileList = await Sequelize.query(query, { type: QueryTypes.SELECT })
		}
	}

	// get chosen newsletter
	let attributes = [
		language == "en" ? ["en_sub", "header"] : ["es_sub", "header"],
		language == "en" ? ["en_desc", "desc"] : ["es_desc", "desc"],
		"author",
		"published",
		"show_contact",
		[Sequelize.col("newsletterimages.image"), "image"]
	]
	const theNewsLetter = await NewsletterData.findOne({ attributes, where: { id: id }, include: [{ model: NewsletterImage, attributes: [] }], row: true })

	// send sms begin //
	const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN)

	const smsText = "Alert\n\n" + theNewsLetter.header + "\n" + theNewsLetter.author + "\n" + " - " + theNewsLetter.published + "\n"
	smsText += process.env.SITE_URL + "/newsletter/detail?id=" + id

	try {
		if (mobileList.length) {
			for (let phone of mobileList) {
				if (phone.mobile.trim() !== "") {
					await client.messages.create({ from: process.env.TWILIO_PHONE, to: `+1${phone.trim()}`, body: smsText.replace(/&nbsp;/g, "").replace(/<\/?[^>]+(>|$)/g, "") })
				}
			}
		}
	} catch (error) {
	}
	// send sms end //

	res.status(200).json({ status: "success" })
}

exports.getEducationMaterial = async (req, res, next) => {
	const medCondIDArray = JSON.parse(req.body.med_cond)

	let resultData = []
	for (var id of medCondIDArray) {
		const tag = await EducationTag.findOne({ where: { id: id }, row: true })

		// Education Docs
		const docs = await EducationDoc.findAll({ attributes: [
			'id',
			['title_en', 'name'],
			['desc_en', 'desc'],
			['url_en', 'doc']
		], where: { tag: tag.tag, status: 1 }, row: true })
		docs.forEach(item => {
			resultData.push({
				value: "doc_" + item.id,
				text: tag.tag + " - Doc - " + item.name
			})
		})

		// Education Videos
		const videos = await EducationVideo.findAll({ attributes: [
			'id',
			['url_en', 'doc']
		], where: { tag: tag.tag, status: 1 }, row: true })
		videos.forEach(item => {
			resultData.push({
				value: "doc_" + item.id,
				text: tag.tag + " - Doc - " + item.url
			})
		})
	}

	res.status(200).json({ data: resultData })
}
