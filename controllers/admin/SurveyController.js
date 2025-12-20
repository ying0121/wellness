
const path = require("path")
const ejs = require("ejs")
const twilio = require("twilio")
const nodemailer = require("nodemailer")

const AreaToggle = require("../../models/AreaToggle")
const Translation = require("../../models/Translation")
const ContactInfo = require("../../models/ContactInfo")
const SurveyData = require("../../models/SurveyData")
const SurveyResult = require("../../models/SurveyResult")
const SurveyQuestion = require("../../models/SurveyQuestion")
const SurveyRes = require("../../models/SurveyRes")
const SurveyCat = require("../../models/SurveyCat")
const SurveyFooter = require("../../models/SurveyFooter")
const ContactEmail = require("../../models/ContactEmail")
const FComContact = require("../../models/FComContact")

const { Op, Sequelize } = require('sequelize')

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

	data.sideItem = "surveys"
	data.site_url = process.env.SITE_URL
	data.prefix = process.env.PREFIX_URL
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

	data.emails = await FComContact.findAll({ attributes: ["name", "email"] })

	data.phones = await FComContact.findAll({ attributes: ["name", "cel"] })
	
	res.render('admin/survey/index', data)
}
exports.renderViewResult = async (req, res, next) => {
	let data = {}

	data.site_url = process.env.SITE_URL
	data.prefix = process.env.PREFIX_URL
	data.menus = req.session.adminUser.access_rights
	data.userType = req.session.adminUser.type
	data.loginTime = req.session.loginTime
	data.expiredTime = req.session.expiredTime
	data.userFullName = req.session.adminUser.fname + " " + req.session.adminUser.lname

	const id = req.query.id
	data.id = id
	data.view = req.query.view

	const _a = await AreaToggle.findAll()
	data.area_toggle = {}
	_a.forEach(item => { data.area_toggle[item.area_id] = item.status })

	const _t = await Translation.findAll()
	data.component= []
	_t.forEach(item => { data.component[item.keyvalue] = [], data.component[item.keyvalue].en = item.en, data.component[item.keyvalue].es = item.es })

	data.contact_info = await ContactInfo.findOne({ where: { id: 1 } })

	// 1. Get survey name
	const survey = await SurveyData.findOne({ attributes: ["en_sub"], where: { id } })

	const survey_name = survey ? survey.en_sub : null

	// 2. Get survey results
	const results = await SurveyResult.findAll({ where: { surveyid: id }, raw: true })

	if (!results || results.length === 0) {
		return [survey_name, 0, [], []]
	}

	// Parse quiz + responses from first result
	const questions = JSON.parse(results[0].quiz)
	const responses = JSON.parse(results[0].res)

	let minDate = "9999-99-99"
	let maxDate = "0000-00-00"
	const tempValues = [];

	results.forEach(r => {
		tempValues.push(JSON.parse(r.value))

		if (minDate > r.created) minDate = r.created
		if (maxDate < r.created) maxDate = r.created
	})

	const tempResult = []

	for (let i = 0; i < questions.length; i++) {
		// Fetch question text
		const tempQuiz = await SurveyQuestion.findOne({ attributes: ["en_name"], where: { id: questions[i] }, raw: true })

		// Fetch response options
		const tempRes = await SurveyRes.findOne({ attributes: ["en_name"], where: { id: responses[i] }, raw: true })

		const items = tempRes.en_name.split(",")

		const tmp = []
		for (let j = 0; j < tempValues.length; j++) {
			tmp.push(tempValues[j][i])
		}

		// Count values like array_count_values
		const tempvalueArr = tmp.reduce((acc, val) => {
			acc[val] = (acc[val] || 0) + 1
			return acc
		}, {})

		const tmprate = []
		for (const [key, count] of Object.entries(tempvalueArr)) {
			tmprate.push({ name: items[key] ?? key, counts: count })
		}

		tempResult.push({ quiz: tempQuiz.en_name, result: tmprate })
	}

	data.result = [survey_name, results.length, tempResult, { maxDate, minDate }]

	data.emails = await ContactEmail.findAll({ attributes: [["contact_name", "name"], "email"] })

	res.render('admin/survey/result', data)
}
exports.renderQuestion = async (req, res, next) => {
	let data = {}

	data.site_url = process.env.SITE_URL
	data.prefix = process.env.PREFIX_URL
	data.menus = req.session.adminUser.access_rights
	data.userType = req.session.adminUser.type
	data.loginTime = req.session.loginTime
	data.expiredTime = req.session.expiredTime
	data.userFullName = req.session.adminUser.fname + " " + req.session.adminUser.lname

	const id = req.query.id
	data.id = id

	const _a = await AreaToggle.findAll()
	data.area_toggle = {}
	_a.forEach(item => { data.area_toggle[item.area_id] = item.status })

	const _t = await Translation.findAll()
	data.component= []
	_t.forEach(item => { data.component[item.keyvalue] = [], data.component[item.keyvalue].en = item.en, data.component[item.keyvalue].es = item.es })

	data.contact_info = await ContactInfo.findOne({ where: { id: 1 } })

	// Select fields based on language
	const _r = await SurveyData.findOne({ attributes: ['id', ['en_sub', 'sub'], ['en_desc', 'desc'], 'quiz', 'res', 'created'], where: { id } })

	let result = _r.dataValues

	if (!result) return null

	const tmpquiz = result.quiz ? JSON.parse(result.quiz) : [0]
	const tmpres = result.res ? JSON.parse(result.res) : [0]
	const tempResult = {
		id: result.id,
		created: result.created,
		sub: result.sub,
		desc: result.desc,
		quiz: [],
		res: []
	}
	// Fetch quiz details
	for (const quizId of tmpquiz) {
		const quizAttributes = ['id', ['en_name', 'quiz']]

		const quiz = await SurveyQuestion.findOne({
			attributes: [...quizAttributes, [Sequelize.col('surveyData.en_name'), 'catname']],
			include: [{
				model: SurveyCat,
				as: "surveyData",
				attributes: [],
				required: false,
				on: { id: { [Op.eq]: Sequelize.col('survey_questions.category') } }
			}],
			where: { id: quizId }
		})
		if (quiz) tempResult.quiz.push(quiz.dataValues)
	}
	// Fetch response details
	for (const resId of tmpres) {
		const res = await SurveyRes.findOne({ attributes: ['id', ['en_name', 'res']], where: { id: resId } })
		if (res) tempResult.res.push(res.dataValues)
	}

	data.result = tempResult

	data.responses = []
	const _resp = await SurveyRes.findAll({ attributes: ["id", ["en_name", "response"]] })
	_resp.forEach(item => { data.responses.push(item.dataValues) })

	const questions = await SurveyQuestion.findAll({
		attributes: ['id', 'category', ['en_name', 'question'], [Sequelize.col('surveyData.en_name'), 'cat']],
		include: [{ model: SurveyCat, as: "surveyData", attributes: [], required: false }],
		order: [[{ model: SurveyCat, as: 'surveyData' }, 'en_name', 'ASC']]
	})

	let _q = {}
	let _c = ""

	questions.forEach(item => {
		const q = item.get({ plain: true })
		const catName = q.cat

		if (catName) {
			if (_c !== catName) {
				_c = catName
				_q[_c] = [{ id: item.dataValues.id, catid: item.dataValues.category, question: item.dataValues.question }]
			} else {
				_q[_c].push({ id: item.dataValues.id, catid: item.dataValues.category, question: item.dataValues.question })
			}
		}
	})

	data.questions = _q

	res.render('admin/survey/questions', data)
}

exports.getSurveys = async (req, res, next) => {
	const surveys = await SurveyData.findAll()

	res.status(200).json({ data: surveys })
}
exports.addSurvey = async (req, res, next) => {
	const en_sub = req.body.en_sub
	const es_sub = req.body.es_sub
	const en_desc = req.body.en_desc
	const es_desc = req.body.es_desc
	const created = new Date(Date.now())
	const status = 1

	await SurveyData.create({ en_sub, es_sub, en_desc, es_desc, created, status })

	res.status(200).json({ status: "success" })
}
exports.chosenSurvey = async (req, res, next) => {
	const id = req.body.id

	const survey = await SurveyData.findOne({ where: { id: id } })

	res.status(200).json(survey)
}
exports.editSurvey = async (req, res, next) => {
	const id = req.body.id
	const en_sub = req.body.en_sub
	const es_sub = req.body.es_sub
	const en_desc = req.body.en_desc
	const es_desc = req.body.es_desc

	await SurveyData.update({ en_sub, es_sub, en_desc, es_desc, }, { where: { id: id } })

	res.status(200).json({ status: "success" })
}
exports.deleteSurvey = async (req, res, next) => {
	const id = req.body.id

	await SurveyData.destroy({ where: { id: id } })

	res.status(200).json({ status: "success" })
}

exports.sendEmail = async (req, res, next) => {
	const id = req.body.id
	const emails = req.body.emails
	const language = req.body.lang == 2 ? "es" : "en"

	const contactInfo = await ContactInfo.findOne({ where: { id: 1 } })

	// update survey date
	await SurveyData.update({ created: new Date(Date.now()) }, { where: { id: id } })
	
	let attributes = language === "en" ? ["id", ["en_sub", "sub"], ["en_desc", "desc"], "quiz", "res", "created"] : ["id", ["es_sub", "sub"], ["es_desc", "desc"], "quiz", "res", "created"]
	const survey = await SurveyData.findOne({ attributes, where: { id } })
	const tempQuiz = survey.quiz ? JSON.parse(survey.quiz) : []
	const tempRes = survey.res ? JSON.parse(survey.res) : []
	const surveyData = {
		id: survey.id,
		created: survey.created,
		sub: survey.sub,
		desc: survey.desc,
		quiz: [],
		res: []
	}
	// quizzes with category
	for (let qid of tempQuiz) {
		const quiz = await SurveyQuestion.findOne({
			attributes: language === "en" ? ["id", ["en_name", "quiz"]] : ["id", ["es_name", "quiz"]],
			include: [{
				model: SurveyCat,
				as: "surveyData",
				attributes: language === "en" ? ["id", ["en_name", "catname"]] : ["id", ["es_name", "catname"]],
				required: false
			}],
			where: { id: qid }
		})

		if (quiz) {
			surveyData.quiz.push(quiz.dataValues)
		}
	}
	// responses
	for (let rid of tempRes) {
		const response = await SurveyQuestion.findOne({
			attributes: language === "en" ? ["id", ["en_name", "res"]] : ["id", ["es_name", "res"]],
			where: { id: rid }
		})

		if (response) {
			surveyData.res.push(response.dataValues)
		}
	}

	const footer = await SurveyFooter.findOne({ attributes: language === "en" ? ["id", ["en", "desc"]] : ["id", ["es", "desc"]], where: { id: 1 } })

	// send email begin //
	const emailConfig = {
		id: id,
		site_url: process.env.SITE_URL,
		prefix: process.env.PREFIX_URL,
		lang: language,
		sub: surveyData.sub,
		desc: surveyData.desc,
		footer: footer.desc
	}
	const emailSubject = `${contactInfo.name} : ${surveyData.sub}`
	ejs.renderFile(path.join(__dirname, '../../views/email/surveyemail.ejs'), emailConfig, (error, data) => {
		if (error) {
		} else {
			const mailOptions = {
				from: process.env.MAIL_USERNAME,
				to: emails,
				subject: emailSubject,
				html: data
			}

			transporter.sendMail(mailOptions, (error, info) => { })
		}
	})
	// send email end //

	res.status(200).json({ status: "success" })
}

exports.sendSMS = async (req, res, next) => {
	const id = req.body.id
	const phones = req.body.phones.split(",")
	const language = req.body.lang == 2 ? "es" : "en"

	// update survey date
	await SurveyData.update({ created: new Date(Date.now()) }, { where: { id: id } })
	
	let attributes = language === "en" ? ["id", ["en_sub", "sub"], ["en_desc", "desc"], "quiz", "res", "created"] : ["id", ["es_sub", "sub"], ["es_desc", "desc"], "quiz", "res", "created"]
	const survey = await SurveyData.findOne({ attributes, where: { id } })
	const tempQuiz = survey.quiz ? JSON.parse(survey.quiz) : []
	const tempRes = survey.res ? JSON.parse(survey.res) : []
	const surveyData = {
		id: survey.id,
		created: survey.created,
		sub: survey.sub,
		desc: survey.desc,
		quiz: [],
		res: []
	}
	// quizzes with category
	for (let qid of tempQuiz) {
		const quiz = await SurveyQuestion.findOne({
			attributes: language === "en" ? ["id", ["en_name", "quiz"]] : ["id", ["es_name", "quiz"]],
			include: [{
				model: SurveyCat,
				as: "surveyData",
				attributes: language === "en" ? ["id", ["en_name", "catname"]] : ["id", ["es_name", "catname"]],
				required: false
			}],
			where: { id: qid }
		})

		if (quiz) {
			surveyData.quiz.push(quiz.dataValues)
		}
	}
	// responses
	for (let rid of tempRes) {
		const response = await SurveyQuestion.findOne({
			attributes: language === "en" ? ["id", ["en_name", "res"]] : ["id", ["es_name", "res"]],
			where: { id: rid }
		})

		if (response) {
			surveyData.res.push(response.dataValues)
		}
	}

	// send sms begin //
	const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN)

	const smsText = `${surveyData.sub}*\n${surveyData.desc}\n${process.env.SITE_URL + process.PREFIX_URL}/surveys/submit?id=${id}&lang=${language}`

	try {
		if (phones.length) {
			for (let phone of phones) {
				if (phone.trim() !== "") {
					await client.messages.create({
						from: process.env.TWILIO_PHONE,
						to: `+1${phone.trim()}`,
						body: smsText.replace(/&nbsp;/g, "").replace(/<\/?[^>]+(>|$)/g, "")
					})
				}
			}
		}
	} catch (error) {
	}
	// send sms end //

	res.status(200).json({ status: "success" })
}

exports.chosenResponse = async (req, res, next) => {
	const id = req.body.id

	const response = await SurveyRes.findOne({ attributes: ["id", ["en_name", "response"]], where: { id } })

	res.status(200).json(response)
}

exports.generateSurvey = async (req, res, next) => {
	const id = req.body.id
	const quiz = req.body.quiz
	const response = req.body.res

	await SurveyData.update({ quiz: quiz, res: response }, { where: { id: id } })

	res.status(200).json({ status: "success" })
}

exports.submit = async (req, res, next) => {
	const id = req.query.id
	const language = req.query.lang

	let data = {}
	data.id = id
	data.site_url = process.env.SITE_URL
	data.prefix = process.env.PREFIX_URL

	const _a = await AreaToggle.findAll()
	data.area_toggle = {}
	_a.forEach(item => { data.area_toggle[item.area_id] = item.status })

	const _r = await SurveyData.findOne({ attributes: ['id', ['en_sub', 'sub'], ['en_desc', 'desc'], 'quiz', 'res', 'created'], where: { id } })
	let result = _r.dataValues
	const tmpquiz = result.quiz ? JSON.parse(result.quiz) : [0]
	const tmpres = result.res ? JSON.parse(result.res) : [0]
	const tempResult = {
		id: result.id,
		created: result.created,
		sub: result.sub,
		desc: result.desc,
		quiz: [],
		res: []
	}
	// Fetch quiz details
	for (const quizId of tmpquiz) {
		const quizAttributes = ['id', ['en_name', 'quiz']]

		const quiz = await SurveyQuestion.findOne({
			attributes: [...quizAttributes, [Sequelize.col('surveyData.en_name'), 'catname']],
			include: [{
				model: SurveyCat,
				as: "surveyData",
				attributes: [],
				required: false,
				on: { id: { [Op.eq]: Sequelize.col('survey_questions.category') } }
			}],
			where: { id: quizId }
		})
		if (quiz) tempResult.quiz.push(quiz.dataValues)
	}
	// Fetch response details
	for (const resId of tmpres) {
		const res = await SurveyRes.findOne({ attributes: ['id', ['en_name', 'res']], where: { id: resId } })
		if (res) tempResult.res.push(res.dataValues)
	}
	data.result = tempResult

	data.langs = []
	const attributes = language === "en" ? ["keyvalue", ["en", "lang"]] : ["keyvalue", ["es", "lang"]]
	_l = await Translation.findAll({ attributes, where: { type: "component" } })
	_l.forEach(item => { data.langs.push(item.dataValues) })

	res.render("admin/survey/submit", data)
}

exports.deleteData = async (req, res, next) => {
	const id = req.body.id

	await SurveyResult.destroy({ where: { surveyid: id } })

	res.status(200).json({ status: "success" })
}

exports.sendResultEmail = async (req, res, next) => {
	const id = req.body.id
	const emails = req.body.emails

	// get survey
	const _r = await SurveyData.findOne({ attributes: ['id', ['en_sub', 'sub'], ['en_desc', 'desc'], 'quiz', 'res', 'created'], where: { id } })
	let result = _r.dataValues
	const tmpquiz = result.quiz ? JSON.parse(result.quiz) : [0]
	const tmpres = result.res ? JSON.parse(result.res) : [0]
	const chosenSurvey = {
		id: result.id,
		created: result.created,
		sub: result.sub,
		desc: result.desc,
		quiz: [],
		res: []
	}
	for (const quizId of tmpquiz) {
		const quizAttributes = ['id', ['en_name', 'quiz']]

		const quiz = await SurveyQuestion.findOne({
			attributes: [...quizAttributes, [Sequelize.col('surveyData.en_name'), 'catname']],
			include: [{
				model: SurveyCat,
				as: "surveyData",
				attributes: [],
				required: false,
				on: { id: { [Op.eq]: Sequelize.col('survey_questions.category') } }
			}],
			where: { id: quizId }
		})
		if (quiz) tempResult.quiz.push(quiz.dataValues)
	}
	for (const resId of tmpres) {
		const res = await SurveyRes.findOne({ attributes: ['id', ['en_name', 'res']], where: { id: resId } })
		if (res) chosenSurvey.res.push(res.dataValues)
	}

	// get view result survey
	const results = await SurveyResult.findAll({ where: { surveyid: id }, raw: true })
	if (!results || results.length === 0) {
		return [survey_name, 0, [], []]
	}
	const questions = JSON.parse(results[0].quiz)
	const responses = JSON.parse(results[0].res)
	let minDate = "9999-99-99"
	let maxDate = "0000-00-00"
	const tempValues = []
	results.forEach(r => {
		tempValues.push(JSON.parse(r.value))

		if (minDate > r.created) minDate = r.created
		if (maxDate < r.created) maxDate = r.created
	})
	const tempResult = []
	for (let i = 0; i < questions.length; i++) {
		// Fetch question text
		const tempQuiz = await SurveyQuestion.findOne({ attributes: ["en_name"], where: { id: questions[i] }, raw: true })

		// Fetch response options
		const tempRes = await SurveyRes.findOne({ attributes: ["en_name"], where: { id: responses[i] }, raw: true })

		const items = tempRes.en_name.split(",")

		const tmp = []
		for (let j = 0; j < tempValues.length; j++) {
			tmp.push(tempValues[j][i])
		}

		// Count values like array_count_values
		const tempvalueArr = tmp.reduce((acc, val) => {
			acc[val] = (acc[val] || 0) + 1
			return acc
		}, {})

		const tmprate = []
		for (const [key, count] of Object.entries(tempvalueArr)) {
			tmprate.push({ name: items[key] ?? key, counts: count })
		}

		tempResult.push({ quiz: tempQuiz.en_name, result: tmprate })
	}
	const surveyResult = [survey_name, results.length, tempResult, { maxDate, minDate }]

	const contactInfo = await ContactInfo.findOne({ where: { id: 1 } })

	if (emails) {
		// send email begin //
		const emailConfig = {
			id: id,
			site_url: process.env.SITE_URL,
			prefix: process.env.PREFIX_URL,
			sub: chosenSurvey.sub,
			desc: chosenSurvey.desc,
			result: surveyResult
		}
		const emailSubject = `${contactInfo.name} : ${chosenSurvey.sub}`
		ejs.renderFile(path.join(__dirname, '../../views/email/surveyresultemail.ejs'), emailConfig, (error, data) => {
			if (error) {
			} else {
				const mailOptions = {
					from: process.env.MAIL_USERNAME,
					to: emails,
					subject: emailSubject,
					html: data
				}

				transporter.sendMail(mailOptions, (error, info) => { })
			}
		})
		// send email end //
	}

	res.status(200).json({ status: "success" })
}

exports.result = async (req, res, next) => {
	const id = req.body.id
	const quiz = req.body.quiz
	const response = req.body.res
	const value = req.body.value

	await SurveyResult.create({ surveyid: id, quiz: quiz, res: response, value: value, created: new Date(Date.now()), status: 1 })

	res.status(200).json({ status: "success" })
}
