
const fs = require("fs")
const path = require("path")

const AreaToggle = require("../../models/AreaToggle")
const Translation = require("../../models/Translation")
const ContactInfo = require("../../models/ContactInfo")
const ServiceCategory = require("../../models/ServiceCategory")
const ClinicService = require("../../models/ClinicService") // Fee Model is just ClinicService model

const { Sequelize } = require('sequelize')

exports.render = async (req, res, next) => {
	let data = {}

	data.sideItem = "fees"
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
	
	res.render('admin/fees', data)
}

exports.getFee = async (req, res, next) => {
    const language = req.body.language
    const category = req.body.category
	const status = req.body.status

    const where = {};
	if (category > 0) {
		where.category = category
	}
	if (language > 0) {
		where.language = language
	}
	if (status != "all") {
		where.status = parseInt(status)
	}

	const fees = await ClinicService.findAll({
		where,
		include: [{
			model: ServiceCategory,
			as: "serviceCategory",
			attributes: []
		}],
		attributes: {
			include: [
				[Sequelize.col("serviceCategory.name"), "category_name"] // alias like CI
			]
		},
		raw: true,
		nest: true
	})

   res.status(200).json({ data: fees })
}
exports.addFee = async (req, res, next) => {
	const order = req.body.order
	const key = req.body.key
	const language = req.body.language
	const category = req.body.category
	const title = req.body.title
	const short_desc = req.body.short_desc
	const long_desc = req.body.long_desc
	const status = req.body.status
	const request_service = req.body.request_service
	const online_payment = req.body.online_payment
	const home_page = req.body.home_page
	const cost = req.body.cost
	const show_in_fee = req.body.show_in_fees
	const fee = req.body.fee

	await ClinicService.create({ order, key, language, category, title, short_desc, long_desc, status, request_service, online_payment, home_page, cost, show_in_fee, fee })

	res.status(200).json({ status: "success" })
}
exports.updateFee = async (req, res, next) => {
	const id = req.body.id
	const order = req.body.order
	const key = req.body.key
	const language = req.body.language
	const category = req.body.category
	const title = req.body.title
	const short_desc = req.body.short_desc
	const long_desc = req.body.long_desc
	const status = req.body.status
	const request_service = req.body.request_service
	const online_payment = req.body.online_payment
	const home_page = req.body.home_page
	const cost = req.body.cost
	const show_in_fee = req.body.show_in_fee
	const fee = req.body.fee

	await ClinicService.update({ order, key, language, category, title, short_desc, long_desc, status, request_service, online_payment, home_page, cost, show_in_fee, fee }, { where: { id: id } })

	res.status(200).json({ status: "success" })
}
exports.chosenFee = async (req, res, next) => {
	const id = req.body.id

	const theFee = await ClinicService.findOne({ where: { id: id } })

	res.status(200).json({ data: theFee })
}
exports.deleteFee = async (req, res, next) => {
	const id = req.body.id

	const chosen = await ClinicService.findOne({ where: { id: id } })
	// delete image an video at first
    if (chosen.image) {
        fs.unlink(path.join(__dirname, '../../public/assets/service/image/', chosen.image), (err) => { })
    }
    if (chosen.video) {
        fs.unlink(path.join(__dirname, '../../public/assets/service/video/', chosen.video), (err) => { })
    }

	await ClinicService.destroy({ where: { id: id } })

	res.status(200).json({ status: "success" })
}

exports.getMetaInfo = async (req, res, next) => {
	const header = await Translation.findOne({ where: { keyvalue: "t_fee_header" } })
	const description = await Translation.findOne({ where: { keyvalue: "t_fee_desc" } })
	const footer = await Translation.findOne({ where: { keyvalue: "t_fee_footer" } })
	const note = await Translation.findOne({ where: { keyvalue: "t_fee_note" } })
	res.status(200).json({ data: { header, description, footer, note } })
}
exports.updateMetaInfo = async (req, res, next) => {
	const header_en = req.body.header_en
	const header_es = req.body.header_es
	const desc_en = req.body.desc_en
	const desc_es = req.body.desc_es
	const footer_en = req.body.footer_en
	const footer_es = req.body.footer_es
	const note_en = req.body.note_en
	const note_es = req.body.note_es
	await Translation.update({ en: header_en, es: header_es }, { where: { keyvalue: "t_fee_header" } })
	await Translation.update({ en: desc_en, es: desc_es }, { where: { keyvalue: "t_fee_desc" } })
	await Translation.update({ en: footer_en, es: footer_es }, { where: { keyvalue: "t_fee_footer" } })
	await Translation.update({ en: note_en, es: note_es }, { where: { keyvalue: "t_fee_note" } })
	res.status(200).json({ status: "success" })
}