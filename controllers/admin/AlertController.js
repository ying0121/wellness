
const fs = require("fs")
const path = require("path")

const AreaToggle = require("../../models/AreaToggle")
const Translation = require("../../models/Translation")
const ContactInfo = require("../../models/ContactInfo")
const AlertClinic = require("../../models/AlertClinic")
const Managers = require("../../models/Managers")

const { Sequelize } = require("sequelize")

exports.render = async (req, res, next) => {
	let data = {}

	data.sideItem = "alerts"
	data.site_url = process.env.SITE_URL
	data.prefix = process.env.PREFIX_URL
	data.menus = req.session.adminUser.access_rights
	data.userType = req.session.adminUser.type
	data.loginTime = req.session.loginTime
	data.expiredTime = req.session.expiredTime
	data.userFullName = req.session.adminUser.fname + " " + req.session.adminUser.lname
	data.user = req.session.adminUser

	const _a = await AreaToggle.findAll()
	data.area_toggle = {}
	_a.forEach(item => { data.area_toggle[item.area_id] = item.status })

	const _t = await Translation.findAll()
	data.component= []
	_t.forEach(item => { data.component[item.keyvalue] = [], data.component[item.keyvalue].en = item.en, data.component[item.keyvalue].es = item.es })

	data.contact_info = await ContactInfo.findOne({ where: { id: 1 } })
	
	res.render('admin/alerts', data)
}

exports.read = async (req, res, next) => {
	const alerts = await AlertClinic.findAll({
            include: [{
                model: Managers,
                attributes: ['fname', 'lname'],
                required: true,
                where: {
                    id: Sequelize.col('alert_clinics.created_by')
                }
            }],
            attributes: { include: ['*'] } // Include all attributes from alert_clinic
        })

	res.status(200).json({ data: alerts })
}
exports.chosen = async (req, res, next) => {
	const id = req.body.id

	const alert = await AlertClinic.findOne({ where: { id: id } })

	res.status(200).json(alert)
}
exports.delete = async (req, res, next) => {
	const id = req.body.id

	const alert = await AlertClinic.findOne({ where: { id: id } })

	// delete document at first
    if (alert.image) {
        fs.unlink(path.join(__dirname, '../../public/assets/images/alerts/', alert.image), (err) => { })
    }

	await AlertClinic.destroy({ where: { id: id } })

	res.status(200).json({ status: "success" })
}
