
const fs = require("fs")
const path = require("path")

const AreaToggle = require("../../models/AreaToggle")
const Translation = require("../../models/Translation")
const ContactInfo = require("../../models/ContactInfo")
const ServiceCategory = require("../../models/ServiceCategory")
const ClinicService = require("../../models/ClinicService")

const { Sequelize } = require('sequelize')

exports.render = async (req, res, next) => {
	let data = {}

	data.sideItem = "services"
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
	
	res.render('admin/services', data)
}

exports.getServiceCategory = async (req, res, next) => {
    const serviceCategories = await ServiceCategory.findAll()

    res.status(200).json({ data: serviceCategories })
}
exports.addServiceCategory = async (req, res, next) => {
	const name = req.body.name
	const desc = req.body.desc
	const status = req.body.status

	await ServiceCategory.create({ name, desc, status })

	res.status(200).json({ status: "success" })
}
exports.updateServiceCategory = async (req, res, next) => {
	const id = req.body.id
	const name = req.body.name
	const desc = req.body.desc
	const status = req.body.status

	await ServiceCategory.update({ name, desc, status }, { where: { id: id } })

	res.status(200).json({ status: "success" })
}
exports.chosenServiceCategory = async (req, res, next) => {
	const id = req.body.id

	const serviceCategory = await ServiceCategory.findOne({ where: { id: id } })

	res.status(200).json({ data: serviceCategory })
}
exports.deleteServiceCategory = async (req, res, next) => {
	const id = req.body.id

	await ServiceCategory.destroy({ where: { id: id } })

	res.status(200).json({ status: "success" })
}

exports.getClinicService = async (req, res, next) => {
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

	const services = await ClinicService.findAll({
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

   res.status(200).json({ data: services })
}
exports.addClinicService = async (req, res, next) => {
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

	await ClinicService.create({ order, key, language, category, title, short_desc, long_desc, status, request_service, online_payment, home_page, cost })

	res.status(200).json({ status: "success" })
}
exports.updateClinicService = async (req, res, next) => {
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

	await ClinicService.update({ order, key, language, category, title, short_desc, long_desc, status, request_service, online_payment, home_page, cost }, { where: { id: id } })

	res.status(200).json({ status: "success" })
}
exports.chosenClinicService = async (req, res, next) => {
	const id = req.body.id

	const clinicService = await ClinicService.findOne({ where: { id: id } })

	res.status(200).json({ data: clinicService })
}
exports.deleteClinicService = async (req, res, next) => {
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

exports.getDesc = async (req, res, next) => {
	const desc = await Translation.findOne({ where: { keyvalue: "t_service_desc" } })

	res.status(200).json({ data: desc })
}
exports.updateDesc = async (req, res, next) => {
	const en = req.body.en
	const es = req.body.es

	await Translation.update({ en, es }, { where: { keyvalue: "t_service_desc" } })

	res.status(200).json({ status: "success" })
}
