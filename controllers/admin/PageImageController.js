
const fs = require("fs")
const path = require("path")

const AreaToggle = require("../../models/AreaToggle")
const Translation = require("../../models/Translation")
const ContactInfo = require("../../models/ContactInfo")
const PageImg = require("../../models/PageImg")

exports.render = async (req, res, next) => {
	let data = {}

	data.sideItem = "page-images"
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
	
	res.render('admin/page_images', data)
}

exports.create = async (req, res, next) => {
	const page = req.body.page
	const position = req.body.position
	const img = "default.jpg"
	const status = 1

	await PageImg.create({ page, position, img, status })

	res.status(200).json({ status: "success" })
}
exports.update = async (req, res, next) => {
	const id = req.body.id
	const page = req.body.page
	const position = req.body.position
	const title_en = req.body.title_en
	const title_es = req.body.title_es
	const desc_en = req.body.desc_en
	const desc_es = req.body.desc_es
	const status = req.body.status

	await PageImg.update({ page, position, title_en, title_es, desc_en ,desc_es, status }, { where: { id: id } })

	res.status(200).json({ status: "success" })
}
exports.choose = async (req, res, next) => {
	const id = req.body.id

	const pageImage = await PageImg.findOne({ where: { id: id } })

	res.status(200).json(pageImage)
}
exports.read = async (req, res, next) => {
	const pageImages = await PageImg.findAll()

	res.status(200).json({ data: pageImages })
}
exports.delete = async (req, res, next) => {
	const id = req.body.id

	const choose = await PageImg.findOne({ where: { id: id } })

	// delete image at first
    if (choose.img) {
        fs.unlink(path.join(__dirname, '../../public/assets/images/pageimgs/', choose.img), (err) => { })
    }

	await PageImg.destroy({ where: { id: id } })

	res.status(200).json({ status: "success" })
}
