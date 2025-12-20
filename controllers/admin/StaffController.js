
const fs = require("fs")
const path = require("path")

const AreaToggle = require("../../models/AreaToggle")
const Translation = require("../../models/Translation")
const ContactInfo = require("../../models/ContactInfo")
const Staff = require("../../models/Staff")

exports.render = async (req, res, next) => {
	let data = {}

	data.sideItem = "staffs"
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
	
	res.render('admin/staffs', data)
}

exports.read = async (req, res, next) => {
    const staffs = await Staff.findAll()

    res.status(200).json({ data: staffs })
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
    const acc_assigned = req.body.type_acc_assigned
    const acc_email = req.body.type_acc_email
    const general_assigned = req.body.type_general_assigned
    const general_email = req.body.type_general_email
    const spec_assigned = req.body.type_spec_assigned
    const spec_email = req.body.type_spec_email
    const img = "default.jpg"

    let account_request = 0
    if (acc_assigned == 1) account_request += 1
    if (acc_email == 1) account_request += 2

    let general_online = 0
    if (general_assigned == 1) general_online += 1
    if (general_email == 1) general_online += 2

    let spec_message = 0
    if (spec_assigned == 1) spec_message += 1
    if (spec_email == 1) spec_message += 2

    await Staff.create({ en_name, es_name, en_job, es_job, en_desc, es_desc, en_fdesc, es_fdesc, account_request, general_online, spec_message, status, img })

    res.status(200).json({ status: "success" })
}
exports.choose = async (req, res, next) => {
    const id = req.body.id

    const staff = await Staff.findOne({ where: { id: id } })

    res.status(200).json(staff)
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
    const acc_assigned = req.body.type_acc_assigned
    const acc_email = req.body.type_acc_email
    const general_assigned = req.body.type_general_assigned
    const general_email = req.body.type_general_email
    const spec_assigned = req.body.type_spec_assigned
    const spec_email = req.body.type_spec_email
    const status = req.body.status

    let account_request = 0
    if (acc_assigned == 1) account_request += 1
    if (acc_email == 1) account_request += 2

    let general_online = 0
    if (general_assigned == 1) general_online += 1
    if (general_email == 1) general_online += 2

    let spec_message = 0
    if (spec_assigned == 1) spec_message += 1
    if (spec_email == 1) spec_message += 2

    await Staff.update({ en_name, es_name, en_job, es_job, en_desc, es_desc, en_fdesc, es_fdesc, email, tel, ext, email_tel_ext_toggle, send_message_toggle, account_request, general_online, spec_message, status }, { where: { id: id } })

    res.status(200).json({ status: "success" })
}
exports.delete = async (req, res, next) => {
    const id = req.body.id

    const choose = await Staff.findOne({ where: { id: id } })

    if (choose.img) {
        fs.unlink(path.join(__dirname, '../../public/assets/images/staffs/', choose.img), (err) => { })
    }

    await Staff.destroy({ where: { id: id } })

    res.status(200).json({ status: "success" })
}

exports.updateStaffDesc = async (req, res, next) => {
    const title_en = req.body.title_en
    const title_es = req.body.title_es
    const desc_en = req.body.desc_en
    const desc_es = req.body.desc_es

    await Translation.update({ en: title_en, es: title_es }, { where: { keyvalue: "t_staff_title" } })
    await Translation.update({ en: desc_en, es: desc_es }, { where: { keyvalue: "t_staff_desc" } })

    res.status(200).json({ status: "success" })
}
