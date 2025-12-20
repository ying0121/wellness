
const fs = require("fs")
const path = require("path")

const AreaToggle = require("../../models/AreaToggle")
const Translation = require("../../models/Translation")
const ContactInfo = require("../../models/ContactInfo")
const PatientReview = require("../../models/PatientReview")

exports.render = async (req, res, next) => {
	let data = {}

	data.sideItem = "patient-reviews"
	data.site_url = process.env.SITE_URL
	data.prefix = process.env.PREFIX_URL
	data.google_api_key = process.env.GOOGLE_API_KEY
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
	
	res.render('admin/patient_reviews', data)
}

exports.read = async (req, res, next) => {
    const patientReviews = await PatientReview.findAll()

    res.status(200).json({ data: patientReviews })
}
exports.create = async (req, res, next) => {
    const en_name = req.body.en_name
    const es_name = req.body.es_name
    const en_desc = req.body.en_desc
    const es_desc = req.body.es_desc
    const en_fdesc = req.body.en_fdesc
    const es_fdesc = req.body.es_fdesc
    const status = req.body.status

    await PatientReview.create({ en_name, es_name, en_desc, es_desc, en_fdesc, es_fdesc, status })

    res.status(200).json({ status: "success" })
}
exports.choose = async (req, res, next) => {
    const id = req.body.id

    const patientReview = await PatientReview.findOne({ where: { id: id } })

    res.status(200).json(patientReview)
}
exports.update = async (req, res, next) => {
    const id = req.body.id
    const en_name = req.body.en_name
    const es_name = req.body.es_name
    const en_desc = req.body.en_desc
    const es_desc = req.body.es_desc
    const en_fdesc = req.body.en_fdesc
    const es_fdesc = req.body.es_fdesc
    const status = req.body.status

    await PatientReview.update({ en_name, es_name, en_desc, es_desc, en_fdesc, es_fdesc, status }, { where: { id: id } })

    res.status(200).json({ status: "success" })
}
exports.delete = async (req, res, next) => {
    const id = req.body.id

    const choose = await PatientReview.findOne({ where: { id: id } })

    if (choose.img) {
        fs.unlink(path.join(__dirname, '../../public/assets/images/patient_review/', choose.img), (err) => { })
    }

    await PatientReview.destroy({ where: { id: id } })

    res.status(200).json({ status: "success" })
}
