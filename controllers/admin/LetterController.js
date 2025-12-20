
const fs = require("fs")
const path = require("path")

const AreaToggle = require("../../models/AreaToggle")
const Translation = require("../../models/Translation")
const ContactInfo = require("../../models/ContactInfo")
const LetterCategories = require("../../models/LetterCategories")
const Letters = require("../../models/Letters")
const FVsLanguage = require("../../models/FVsLanguage")
const LetterDesc = require("../../models/LetterDesc")

const { Sequelize } = require('sequelize')

exports.render = async (req, res, next) => {
	let data = {}

	data.sideItem = "letter"
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
	
	res.render('admin/letters', data)
}

exports.readLetterCategory = async (req, res, next) => {
    const language = req.body.lang

    const where = {};
    if (language > 0) {
        where.id = language // f_vs_languages.id
    }

    const letterCategories = await LetterCategories.findAll({
        attributes: [
            "id", "name", "desc", "status", "lang",  // <-- include actual columns from letter_categories
            [Sequelize.col("FVsLanguage.English"), "language"] // alias "English" as language
        ],
        include: [{
            model: FVsLanguage,
            as: "FVsLanguage", // use alias same as association
            attributes: [],
            required: false, // LEFT JOIN
            where: Object.keys(where).length ? where : undefined
        }],
        raw: true
    })

    res.status(200).json({ data: letterCategories })
}
exports.addLetterCategory = async (req, res, next) => {
    const lang = req.body.lang
	const name = req.body.name
	const desc = req.body.desc
	const status = req.body.status

	await LetterCategories.create({ lang, name, desc, status })

	res.status(200).json({ status: "success" })
}
exports.updateLetterCategory = async (req, res, next) => {
	const id = req.body.id
    const lang = req.body.lang
	const name = req.body.name
	const desc = req.body.desc
	const status = req.body.status

	await LetterCategories.update({ lang, name, desc, status }, { where: { id: id } })

	res.status(200).json({ status: "success" })
}
exports.chosenLetterCategory = async (req, res, next) => {
	const id = req.body.id

	const letterCategories = await LetterCategories.findOne({ where: { id: id } })

	res.status(200).json({ data: letterCategories })
}
exports.deleteLetterCategory = async (req, res, next) => {
	const id = req.body.id

	await LetterCategories.destroy({ where: { id: id } })

	res.status(200).json({ status: "success" })
}

exports.readLetters = async (req, res, next) => {
    const language = req.body.language
    const category = req.body.category
	const status = req.body.status

    const where = {}
	if (category > 0) {
		where.category = category
	}
	if (language > 0) {
		where.language = language
	}
	if (status != "all") {
		where.status = parseInt(status)
	}

	const letters = await Letters.findAll({
		where,
		include: [{
			model: LetterCategories,
			as: "LetterCategories",
			attributes: []
		}, {
            model: FVsLanguage,
            as: "FVsLanguage",
            attributes: []
        }],
		attributes: {
			include: [
				[Sequelize.col("LetterCategories.name"), "category_name"], // alias like CI
                [Sequelize.col("FVsLanguage.English"), "language_name"]
			]
		},
		raw: true,
		nest: true
	})

   res.status(200).json({ data: letters })
}
exports.addLetters = async (req, res, next) => {
	const language = req.body.language
	const category = req.body.category
    const icon = req.body.icon
	const title = req.body.title
	const short_desc = req.body.short_desc
	const long_desc = req.body.long_desc
	const status = req.body.status
	const request_letter = req.body.request_letter
	const cost = req.body.cost

	await Letters.create({ language, category, title, short_desc, long_desc, status, request_letter, icon, cost })

	res.status(200).json({ status: "success" })
}
exports.updateLetters = async (req, res, next) => {
	const id = req.body.id
	const language = req.body.language
	const category = req.body.category
    const icon = req.body.icon
	const title = req.body.title
	const short_desc = req.body.short_desc
	const long_desc = req.body.long_desc
	const status = req.body.status
	const request_letter = req.body.request_letter
	const cost = req.body.cost

	await Letters.update({ language, category, title, short_desc, long_desc, status, request_letter, icon, cost }, { where: { id: id } })

	res.status(200).json({ status: "success" })
}
exports.chosenLetters = async (req, res, next) => {
	const id = req.body.id

	const letters = await Letters.findOne({ where: { id: id } })

	res.status(200).json({ data: letters })
}
exports.deleteLetters = async (req, res, next) => {
	const id = req.body.id

	const chosen = await Letters.findOne({ where: { id: id } })
	// delete image an video at first
    if (chosen.image) {
        fs.unlink(path.join(__dirname, '../../public/assets/letter/image/', chosen.image), (err) => { })
    }
    if (chosen.video) {
        fs.unlink(path.join(__dirname, '../../public/assets/letter/video/', chosen.video), (err) => { })
    }

	await Letters.destroy({ where: { id: id } })

	res.status(200).json({ status: "success" })
}

exports.getLetterDescription = async (req, res, next) => {
    const language = req.body.lang
	const desc = await LetterDesc.findOne({ where: { lang: language } })

	res.status(200).json({ data: desc })
}
exports.updateLetterDescription = async (req, res, next) => {
	const language = req.body.lang
    const description = req.body.desc

	// check if existed
    const one = await LetterDesc.findOne({ where: { lang: language } })

    if (one) {
        await one.update({ desc: description })
    } else {
        await LetterDesc.create({ desc: desc })
    }

	res.status(200).json({ status: "success" })
}
