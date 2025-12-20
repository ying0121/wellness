
const AreaToggle = require("../../models/AreaToggle")
const Translation = require("../../models/Translation")
const ContactInfo = require("../../models/ContactInfo")

exports.render = async (req, res, next) => {
	let data = {}

	data.sideItem = "insurance"
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
	
	res.render('admin/insurances', data)
}

exports.updateInsuranceDesc = async (req, res, next) => {
    const title_en = req.body.insurance_title_en
    const title_es = req.body.insurance_title_es
    const desc_en = req.body.insurance_desc_en
    const desc_es = req.body.insurance_desc_es

    await Translation.update({ en: title_en, es: title_es }, { where: { keyvalue: "t_ins_title" } })
    await Translation.update({ en: desc_en, es: desc_es }, { where: { keyvalue: "t_ins_desc" } })
	
	return res.status(200).json({ status: "success" })
}
