
const fs = require("fs")
const path = require("path")

const AreaToggle = require("../../models/AreaToggle")
const Translation = require("../../models/Translation")
const ContactInfo = require("../../models/ContactInfo")
const Doctor = require("../../models/Doctor")

exports.render = async (req, res, next) => {
	let data = {}

	data.sideItem = "doctor"
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
	
	res.render('admin/doctors', data)
}

exports.read = async (req, res, next) => {
    const doctors = await Doctor.findAll()

    res.status(200).json({ data: doctors })
}
exports.create = async (req, res, next) => {
    const en_name = req.body.en_name
    const es_name = req.body.es_name
    const en_job = req.body.en_job
    const es_job = req.body.es_job
    const en_desc = req.body.en_desc
    const es_desc = req.body.es_desc
    const en_fdesc = req.body.en_fdesc
    const es_fdesc = req.body.es_fdesc
    const status = req.body.status

    await Doctor.create({ en_name, es_name, en_job, es_job, en_desc, es_desc, en_fdesc, es_fdesc, status })

    res.status(200).json({ status: "success" })
}
exports.choose = async (req, res, next) => {
    const id = req.body.id

    const doctor = await Doctor.findOne({ where: { id: id } })

    res.status(200).json(doctor)
}
exports.update = async (req, res, next) => {
    const id = req.body.id
    const en_name = req.body.en_name
    const es_name = req.body.es_name
    const en_job = req.body.en_job
    const es_job = req.body.es_job
    const en_desc = req.body.en_desc
    const es_desc = req.body.es_desc
    const en_fdesc = req.body.en_fdesc
    const es_fdesc = req.body.es_fdesc
    const email = req.body.email
    const tel = req.body.tel
    const ext = req.body.ext
    const email_tel_ext_toggle = req.body.email_tel_ext_toggle
    const send_message_toggle = req.body.send_message_toggle
    const npi = req.body.npi
    const specialty = req.body.specialty
    const license = req.body.license
    const license_state = req.body.license_state
    const license_start = req.body.license_start
    const license_end = req.body.license_end
    const dea = req.body.dea
    const dea_start = req.body.dea_start
    const dea_end = req.body.dea_end
    const status = req.body.status

    await Doctor.update({ en_name, es_name, en_job, es_job, en_desc, es_desc, en_fdesc, es_fdesc, email, tel, ext, email_tel_ext_toggle, send_message_toggle, npi, specialty, license, license_state, license_start, license_end, dea, dea_start, dea_end, status }, { where: { id: id } })

    res.status(200).json({ status: "success" })
}
exports.delete = async (req, res, next) => {
    const id = req.body.id

    const choose = await Doctor.findOne({ where: { id: id } })

    if (choose.img) {
        fs.unlink(path.join(__dirname, '../../public/assets/images/doctors/', choose.img), (err) => { })
    }

    await Doctor.destroy({ where: { id: id } })

    res.status(200).json({ status: "success" })
}

exports.updateDoctorDesc = async (req, res, next) => {
    const title_en = req.body.title_en
    const title_es = req.body.title_es
    const desc_en = req.body.desc_en
    const desc_es = req.body.desc_es

    await Translation.update({ en: title_en, es: title_es }, { where: { keyvalue: "t_doctor_title" } })
    await Translation.update({ en: desc_en, es: desc_es }, { where: { keyvalue: "t_doctor_desc" } })

    res.status(200).json({ status: "success" })
}
