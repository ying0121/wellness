
const AreaToggle = require("../../models/AreaToggle")
const Translation = require("../../models/Translation")
const ContactInfo = require("../../models/ContactInfo")
const PageVideo = require("../../models/PageVideo")

exports.render = async (req, res, next) => {
	let data = {}

	data.sideItem = "page-video"
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
	
	res.render('admin/page_videos', data)
}

exports.create = async (req, res, next) => {
	const page = req.body.page
	const position = req.body.position
	const video = req.body.video
	const status = 1

	await PageVideo.create({ page, position, video, status })

	res.status(200).json({ status: "success" })
}
exports.update = async (req, res, next) => {
	const id = req.body.id
	const page = req.body.page
	const video = req.body.video
	const position = req.body.position
	const status = req.body.status

	await PageVideo.update({ page, position, video, status }, { where: { id: id } })

	res.status(200).json({ status: "success" })
}
exports.choose = async (req, res, next) => {
	const id = req.body.id

	const pageVideo = await PageVideo.findOne({ where: { id: id } })

	res.status(200).json(pageVideo)
}
exports.read = async (req, res, next) => {
	const pageVideos = await PageVideo.findAll()

	res.status(200).json({ data: pageVideos })
}
exports.delete = async (req, res, next) => {
	const id = req.body.id

	await PageVideo.destroy({ where: { id: id } })

	res.status(200).json({ status: "success" })
}