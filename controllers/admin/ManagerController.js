
const md5 = require("md5")

const AreaToggle = require("../../models/AreaToggle")
const Translation = require("../../models/Translation")
const ContactInfo = require("../../models/ContactInfo")
const SQuestion = require("../../models/SQuestion")
const Managers = require("../../models/Managers")
const UserSecurity = require("../../models/UserSecurity")

exports.render = async (req, res, next) => {
	let data = {}

	data.sideItem = "managers"
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

	data.answers = await SQuestion.findAll({ where: { status: 1 } })
	
	res.render('admin/managers', data)
}

exports.read = async (req, res, next) => {
	const managers = await Managers.findAll()

	res.status(200).json({ data: managers })
}
exports.create = async (req, res, next) => {
	const fname = req.body.fname
	const lname = req.body.lname
	const email = req.body.email
	const type = req.body.type
	const status = req.body.status
	const access_rights = "[]"

	// check if the email is existed
	const existed = await Managers.findOne({ where: { email: email } })
	if (existed) {
		return res.status(200).json({ status: "existed" })
	} else {
		await Managers.create({ fname, lname, email, access_rights, type, status })

		res.status(200).json({ status: "success" })
	}
}
exports.choose = async (req, res, next) => {
	const id = req.body.id

	const manager = await Managers.findOne({ where: { id: id } })

	res.status(200).json(manager)
}
exports.update = async (req, res, next) => {
	const id = req.body.id
	const fname = req.body.fname
	const lname = req.body.lname
	const email = req.body.email
	const type = req.body.type
	const status = req.body.status

	await Managers.update({ fname, lname, email, type, status }, { where: { id: id } })

	res.status(200).json({ status: "success" })
}
exports.delete = async (req, res, next) => {
	const id = req.body.id

	await Managers.destroy({ where: { id: id } })

	res.status(200).json({ status: "success" })
}

exports.resetPassword = async (req, res, next) => {
	const id = req.body.id
	const password = req.body.pwd

	await Managers.update({ password: md5(password) }, { where: { id: id } })

	res.status(200).json({ status: "success" })
}

exports.updateAccessRights = async (req, res, next) => {
	const id = req.body.id
	const access_rights = req.body.access_rights

	await Managers.update({ access_rights }, { where: { id: id } })

	res.status(200).json({ status: "success" })
}

exports.setSecurity = async (req, res, next) => {
	const user_id = req.body.id
	const question_id = req.body.question_id
	const answer = md5(req.body.answer)
	const user_type = "manager"

	const securities = await UserSecurity.findAll({ where: { user_id: user_id, user_type: user_type, question_id: question_id } })
	if (securities.length) {
		await UserSecurity.update({ user_security: answer }, { where: { user_id: user_id, user_type: user_type, question_id: question_id } })
	} else {
		await UserSecurity.create({ user_id, answer, user_type, question_id })
	}

	res.status(200).json({ status: "success" })
}

exports.readOnlyActive = async (req, res, next) => {
	const securityQuestions = await SQuestion.findAll({ where: { status: 1 } })

	res.status(200).json({ data: securityQuestions })
}

exports.addUserSecurity = async (req, res, next) => {
	const user_id = req.body.user_id
	const user_type = req.body.user_type
	const question_id = req.body.question_id
	const answer = req.body.answer

	// check if is already existed
	const securities = await UserSecurity.findOne({ where: { user_id: user_id, user_type: user_type, question_id: question_id } })
	if (securities) {
		await UserSecurity.update({ answer: md5(answer) }, { where: { user_id: user_id, user_type: user_type, question_id: question_id } })
	} else {
		await UserSecurity.create({ user_id, user_type, question_id, answer })
	}

	res.status(200).json({ status: "success" })
}
