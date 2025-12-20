
const fs = require("fs")
const path = require("path")

const AreaToggle = require("../../models/AreaToggle")
const Translation = require("../../models/Translation")
const ContactInfo = require("../../models/ContactInfo")
const Document = require("../../models/Document")

exports.render = async (req, res, next) => {
	let data = {}

	data.sideItem = "orientation"
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
	
	res.render('admin/orientation', data)
}

exports.read = async (req, res, next) => {
    const documents = await Document.findAll({ where: { page: "Orientation" } })
    res.status(200).json({ data: documents })
}
exports.create = async (req, res, next) => {
    const en_title = req.body.title_en
    const es_title = req.body.title_es
    const en_desc = req.body.desc_en
    const es_desc = req.body.desc_es
    const page = "Orientation"
    const status = 1
    await Document.create({ page, en_title, es_title, en_desc, es_desc, status })

    res.status(200).json({ status: "success" })
}
exports.update = async (req, res, next) => {
    const id = req.body.id
    const en_title = req.body.title_en
    const es_title = req.body.title_es
    const en_desc = req.body.desc_en
    const es_desc = req.body.desc_es

    await Document.update({ en_title, es_title, en_desc, es_desc }, { where: { id: id } })
    res.status(200).json({ status: "success" })
}
exports.choose = async (req, res, next) => {
    const id = req.body.id
    const document = await Document.findOne({ where: { id: id } })

    res.status(200).json({ data: document })
}
exports.delete = async (req, res, next) => {
    const id = req.body.id
    const document = await Document.findOne({ where: { id: id } })

    // delete document at first
    if (document.en_doc) {
        fs.unlink(path.join(__dirname, '../../public/assets/documents/', document.en_doc), (err) => { })
    }
    if (document.es_doc) {
        fs.unlink(path.join(__dirname, '../../public/assets/documents/', document.es_doc), (err) => { })
    }

    // delete data from database
    await Document.destroy({ where: { id: id } })

    res.status(200).json({ status: "success" })
}

exports.updateOrientationDesc = async (req, res, next) => {
    const title_en = req.body.title_en
    const title_es = req.body.title_es
    const desc_en = req.body.desc_en
    const desc_es = req.body.desc_es

    await Translation.update({ en: title_en, es: title_es }, { where: { keyvalue: "t_orientation_title" } })
    await Translation.update({ en: desc_en, es: desc_es }, { where: { keyvalue: "t_orientation_desc" } })

    res.status(200).json({ status: "success" })
}
