
const AreaToggle = require("../../models/AreaToggle")
const Translation = require("../../models/Translation")
const ContactInfo = require("../../models/ContactInfo")
const Measures = require("../../models/Measures")
const QualityCat = require("../../models/QualityCat")

const { Sequelize } = require('sequelize')

exports.render = async (req, res, next) => {
	let data = {}

	data.sideItem = "about_us"
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
	
	res.render('admin/about_us', data)
}

exports.measureByCateId = async (req, res, next) => {
	let data = {}

	data.sideItem = "about_us"
	data.site_url = process.env.SITE_URL
	data.prefix = process.env.PREFIX_URL
	data.menus = req.session.adminUser.access_rights
	data.userType = req.session.adminUser.type
	data.loginTime = req.session.loginTime
	data.expiredTime = req.session.expiredTime
	data.userFullName = req.session.adminUser.fname + " " + req.session.adminUser.lname

	data.catid = req.query.id
	data.topics = await QualityCat.findAll({
		attributes: {
			include: [[Sequelize.fn('COUNT', Sequelize.col('measures.id')), 'cnt']]
		},
		include: [{
			model: Measures,
			required: false,
			attributes: []
		}],
		group: ['quality_cats.id']
	})

	data.contact_info = await ContactInfo.findOne({ where: { id: 1 } })
	data.acronym = data.contact_info.acronym

	const _a = await AreaToggle.findAll()
	data.area_toggle = []
	_a.forEach(item => { data.area_toggle[item.area_id] = item.status })

	res.render('admin/measure_by_cat', data)
}

exports.updateAboutClinic = async (req, res, next) => {
	const en_desc = req.body.en_desc
	const es_desc = req.body.es_desc
	const en_fdesc = req.body.en_fdesc
	const es_fdesc = req.body.es_fdesc

	await Translation.update({ en: en_desc, es: es_desc }, { where: { keyvalue: "t_about_clinic_desc" } })
	await Translation.update({ en: en_fdesc, es: es_fdesc }, { where: { keyvalue: "t_about_clinic_fdesc" } })

	res.status(200).json({ status: "success" })
}

exports.updateMetricsDesc = async (req, res, next) => {
	const title_en = req.body.title_en
	const title_es = req.body.title_es
	const desc_en = req.body.desc_en
	const desc_es = req.body.desc_es

	await Translation.update({ en: title_en, es: title_es }, { where: { keyvalue: "t_quality_metrics_title" } })
	await Translation.update({ en: desc_en, es: desc_es }, { where: { keyvalue: "t_quality_metrics_desc" } })

	res.status(200).json({ status: "success" })
}

// quality categories
exports.readQualityCategories = async (req, res, next) => {
	const result = await QualityCat.findAll({
		attributes: {
			include: [[Sequelize.fn('COUNT', Sequelize.col('measures.id')), 'cnt']]
		},
		include: [{
			model: Measures,
			required: false,
			attributes: []
		}],
		group: ['quality_cats.id']
	})

	res.status(200).json({ data: result })
}
exports.createQualityCategory = async (req, res, next) => {
	const en_name = req.body.en
	const es_name = req.body.es
	const status = 1
	
	await QualityCat.create({ en_name, es_name, status })

	res.status(200).json({ status: "success" })
}
exports.chooseQualityCategory = async (req, res, next) => {
	const id = req.body.id
	const qualityCat = await QualityCat.findOne({ where: { id: id } })

	res.status(200).json({ data: qualityCat })
}
exports.updateQualityCategory = async (req, res, next) => {
	const id = req.body.id
	const en_name = req.body.en
	const es_name = req.body.es
	const status = 1

	await QualityCat.update({ en_name, es_name, status }, { where: { id: id } })

	res.status(200).json({ status: "success" })
}
exports.deleteQualityCategory = async (req, res, next) => {
	const id = req.body.id
	await QualityCat.destroy({ where: { id: id } })

	res.status(200).json({ status: "success" })
}

// measures
exports.readMeasures = async (req, res, next) => {
	const id = req.body.id
	const measures = await Measures.findAll({ where: { catid: id } })
	res.status(200).json({ data: measures })
}
exports.createMeasure = async (req, res, next) => {
	const catid = req.body.id
	const measure_en = req.body.measure_en
    const measure_es = req.body.measure_es
    const denominator = req.body.denominator
    const numerator = req.body.numerator
    const sdate = req.body.sdate
    const edate = req.body.edate
    const desc_en = req.body.desc_en
    const desc_es = req.body.desc_es
    const fdesc_en = req.body.fdesc_en
    const fdesc_es = req.body.fdesc_es
	const status = 1

	await Measures.create({ catid, measure_en, measure_es, denominator, numerator, sdate, edate, desc_en, desc_es, fdesc_en, fdesc_es, status })

	res.status(200).json({ status: "success" })
}
exports.chooseMeasure = async (req, res, next) => {
	const id = req.body.id
	const measure = await Measures.findOne({ where: { id: id } })
	res.status(200).json({ data: measure })
}
exports.updateMeasure = async (req, res, next) => {
	const id = req.body.id
	const catid = req.body.topic
	const measure_en = req.body.measure_en
    const measure_es = req.body.measure_es
    const denominator = req.body.denominator
    const numerator = req.body.numerator
    const sdate = req.body.sdate
    const edate = req.body.edate
    const desc_en = req.body.desc_en
    const desc_es = req.body.desc_es
    const fdesc_en = req.body.fdesc_en
    const fdesc_es = req.body.fdesc_es
	const status = req.body.status

	await Measures.update({ catid, measure_en, measure_es, denominator, numerator, sdate, edate, desc_en, desc_es, fdesc_en, fdesc_es, status }, { where: { id: id } })

	res.status(200).json({ status: "success" })
}
exports.deleteMeasure = async (req, res, next) => {
	const id = req.body.id
	await Measures.destroy({ where: { catid: id } })
	res.status(200).json({ status: "success" })
}
