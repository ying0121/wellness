
const fs = require('fs')
const path = require('path')

const AreaToggle = require("../../models/AreaToggle")
const Translation = require("../../models/Translation")
const ContactInfo = require("../../models/ContactInfo")
const EducationVideo = require("../../models/EducationVideo")
const EducationDoc = require("../../models/EducationDoc")

exports.render = async (req, res, next) => {
	let data = {}

	data.sideItem = "education"
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
	
	res.render('admin/educations', data)
}

exports.readVideo = async (req, res, next) => {
    const tag = req.body.tag

    const videos = await EducationVideo.findAll({ where: { tag: tag } })

    res.status(200).json({ data: videos })
}
exports.addVideo = async (req, res, next) => {
    const title_en = req.body.title_en
    const title_es = req.body.title_es
    const url_en = req.body.url_en
    const url_es = req.body.url_es
    const status = req.body.status
    const tag = req.body.tag

    await EducationVideo.create({ title_en, title_es, url_en, url_es, status, tag })

    res.status(200).json({ status: "success" })
}
exports.updateVideo = async (req, res, next) => {
    const id = req.body.id
    const title_en = req.body.title_en
    const title_es = req.body.title_es
    const url_en = req.body.url_en
    const url_es = req.body.url_es
    const status = req.body.status
    const tag = req.body.tag

    await EducationVideo.update({ title_en, title_es, url_en, url_es, status, tag }, { where: { id: id } })

    res.status(200).json({ status: "success" })
}
exports.deleteVideo = async (req, res, next) => {
    const id = req.body.id

    await EducationVideo.destroy({ where: { id: id } })

    res.status(200).json({ status: "success" })
}
exports.readVideoById = async (req, res, next) => {
    const id = req.body.id

    const video = await EducationVideo.findOne({ where: { id: id } })

    res.status(200).json(video)
}

exports.readDocument = async (req, res, next) => {
    const tag = req.body.tag

    const documents = await EducationDoc.findAll({ where: { tag: tag } })

    res.status(200).json({ data: documents })
}
exports.addDocument = async (req, res, next) => {
    const title_en = req.body.title_en
    const title_es = req.body.title_es
    const desc_en = req.body.desc_en
    const desc_es = req.body.desc_es
    const status = req.body.status
    const tag = req.body.tag

    await EducationDoc.create({ title_en, title_es, desc_en, desc_es, status, tag })

    res.status(200).json({ status: "success" })
}
exports.updateDocument = async (req, res, next) => {
    const id = req.body.id
    const title_en = req.body.title_en
    const title_es = req.body.title_es
    const desc_en = req.body.desc_en
    const desc_es = req.body.desc_es
    const status = req.body.status
    const tag = req.body.tag

    await EducationDoc.update({ title_en, title_es, desc_en, desc_es, status, tag }, { where: { id: id } })

    res.status(200).json({ status: "success" })
}
exports.deleteDocument = async (req, res, next) => {
    const id = req.body.id

    const document = await EducationDoc.findOne({ where: { id: id } })

    // delete document at first
    if (document.url_en) {
        fs.unlink(path.join(__dirname, '../../public/assets/education/', document.url_en), (err) => { })
    }
    if (document.url_es) {
        fs.unlink(path.join(__dirname, '../../public/assets/education/', document.url_es), (err) => { })
    }

    await EducationDoc.destroy({ where: { id: id } })

    res.status(200).json({ status: "success" })
}
exports.readDocumentById = async (req, res, next) => {
    const id = req.body.id

    const document = await EducationDoc.findOne({ where: { id: id } })

    res.status(200).json(document)
}
