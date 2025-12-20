
const express = require('express')
const path = require('path')
const fs = require("fs")
const mime = require('mime')

const AreaToggle = require("../../models/AreaToggle")
const Translation = require("../../models/Translation")
const ContactInfo = require("../../models/ContactInfo")
const WorkingHour = require("../../models/WorkingHour")
const SocialMedia = require("../../models/SocialMedia")

exports.render = async (req, res, next) => {
	let data = {}

	data.sideItem = "the_clinic"
	data.site_url = process.env.SITE_URL
	data.prefix = process.env.PREFIX_URL
	data.menus = req.session.adminUser.access_rights
	data.userType = req.session.adminUser.type
	data.loginTime = req.session.loginTime
	data.expiredTime = req.session.expiredTime
	data.userFullName = req.session.adminUser.fname + " " + req.session.adminUser.lname

    data.google_api_key = process.env.GOOGLE_API_KEY

	const _a = await AreaToggle.findAll()
	data.area_toggle = {}
	_a.forEach(item => { data.area_toggle[item.area_id] = item.status })

	const _t = await Translation.findAll()
	data.component= []
	_t.forEach(item => { data.component[item.keyvalue] = [], data.component[item.keyvalue].en = item.en, data.component[item.keyvalue].es = item.es })

	data.contact_info = await ContactInfo.findOne({ where: { id: 1 } })
	data.acronym = data.contact_info.acronym

	res.render('admin/the_clinic', data)
}

// working hours
exports.readWorkingHour = async (req, res, next) => {
    const workingHour = await WorkingHour.findAll()
    res.status(200).json({ data: workingHour })
}
exports.createWorkingHour = async (req, res, next) => {
    const en_name = req.body.en_day
    const es_name = req.body.es_day
    const en_time = req.body.en_time
    const es_time = req.body.es_time
    const status = 1

    await WorkingHour.create({ en_name, es_name, en_time, es_time, status })

    res.status(200).json({ status: "success" })
}
exports.chooseWorkingHour = async (req, res, next) => {
    const id = req.body.id

    const workingHour = await WorkingHour.findOne({ where: { id: id } })

    res.status(200).json({ data: workingHour })
}
exports.updateWorkingHour = async (req, res, next) => {
    const id = req.body.id
    const en_name = req.body.en_day
    const es_name = req.body.es_day
    const en_time = req.body.en_time
    const es_time = req.body.es_time

    await WorkingHour.update({ en_name, es_name, en_time, es_time }, { where: { id: id } })

    res.status(200).json({ status: "success" })
}
exports.deleteWorkingHour = async (req, res, next) => {
    const id = req.body.id

    await WorkingHour.destroy({ where: { id: id } })

    res.status(200).json({ status: "success" })
}

// social media
exports.readSocialMedia = async (req, res, next) => {
    const socialMedia = await SocialMedia.findAll()
    res.status(200).json({ data: socialMedia })
}
exports.createSocialMedia = async (req, res, next) => {
    const img = "default.jpg"
    const url = req.body.url
    const status = 1

    await SocialMedia.create({ img, url, status })

    res.status(200).json({ status: "success" })
}
exports.chooseSocialMedia = async (req, res, next) => {
    const id = req.body.id

    const socialMedia = await SocialMedia.findOne({ where: { id: id } })

    res.status(200).json({ data: socialMedia })
}
exports.updateSocialMedia = async (req, res, next) => {
    const id = req.body.id
    const url = req.body.url
    const status = req.body.status

    await SocialMedia.update({ url, status }, { where: { id: id } })

    res.status(200).json({ status: "success" })
}
exports.deleteSocialMedia = async (req, res, next) => {
    const id = req.body.id

    // delete image
    const socialMedia = await SocialMedia.findOne({ where: { id: id } })
    if (socialMedia.img != "default.jpg") {
        fs.unlink(path.join(__dirname, '../../public/assets/images/social_media/', socialMedia.img), (err) => {
            if (err) console.error('Error deleting old image:', err)
        })
    }

    await SocialMedia.destroy({ where: { id: id } })

    res.status(200).json({ status: "success" })
}

exports.updateAdditional = async (req, res, next) => {
    const data = JSON.parse(req.body.infoes)
    await Translation.update({ en: data[0], es: data[1] }, { where: {keyvalue: "t_clinic_additional_1_title"} })
    await Translation.update({ en: data[2], es: data[3] }, { where: {keyvalue: "t_clinic_additional_1_desc"} })
    await Translation.update({ en: data[4], es: data[5] }, { where: {keyvalue: "t_clinic_additional_2_title"} })
    await Translation.update({ en: data[6], es: data[7] }, { where: {keyvalue: "t_clinic_additional_2_desc"} })
    await Translation.update({ en: data[8], es: data[9] }, { where: {keyvalue: "t_clinic_additional_3_title"} })
    await Translation.update({ en: data[10], es: data[11] }, { where: {keyvalue: "t_clinic_additional_3_desc"} })
    await Translation.update({ en: data[12], es: data[13] }, { where: {keyvalue: "t_clinic_additional_4_title"} })
    await Translation.update({ en: data[14], es: data[15] }, { where: {keyvalue: "t_clinic_additional_4_desc"} })
    await Translation.update({ en: data[16], es: data[17] }, { where: {keyvalue: "t_clinic_additional_5_title"} })
    await Translation.update({ en: data[18], es: data[19] }, { where: {keyvalue: "t_clinic_additional_5_desc"} })

    res.status(200).json({ status: "success" })
}

exports.updateAfterHour = async (req, res, next) => {
    const after_hours_en = req.body.after_hours_en
    const after_hours_es = req.body.after_hours_es
    await Translation.update({ en: after_hours_en, es:after_hours_es }, { where: {keyvalue: "t_after_hours"} })

    res.status(200).json({ status: "success" })
}

exports.updateContactInfo = async (req, res, next) => {
    const name = req.body.name
    const address = req.body.address
    const acronym = req.body.acronym
    const city = req.body.city
    const state = req.body.state
    const zip = req.body.zip
    const tel = req.body.tel
    const fax = req.body.fax
    const email = req.body.email
    const domain = req.body.domain
    const portal = req.body.portal
    const portal_show = req.body.portal_show
    const status = 1

    await ContactInfo.update({ name, address, acronym, city, state, zip, tel, fax, email, domain, portal, portal_show, status }, { where: { id: 1 } })

    res.status(200).json({ status: "success" })
}

exports.getQRCode = async (req, res, next) => {
    const filetype = req.query.filetype

    // Check session data
    if (!req.session.adminUser || req.session.isAdminLogin === false) {
        return res.redirect(process.env.PREFIX_URL) // Redirect if not logged in
    }

    let filePath = ''
    if (filetype === 'png') {
        filePath = path.join(__dirname, '../../public/assets/images/qrcode.png')
    } else if (filetype === 'pdf') {
        filePath = path.join(__dirname, '../../public/assets/documents/qrcode.pdf')
    }

    // Check if the file exists and is readable
    fs.access(filePath, fs.constants.R_OK, (err) => {
        if (err) {
            return res.status(404).send('File not found') // Return 404 if file is not found
        }

        // Set appropriate headers
        res.setHeader('Content-Description', 'File Transfer')
        res.setHeader('Content-Type', mime.getType(filePath)) // Use mime to get content type
        res.setHeader('Content-Disposition', `attachment; filename="${path.basename(filePath)}"`)
        res.setHeader('Expires', '0')
        res.setHeader('Cache-Control', 'must-revalidate')
        res.setHeader('Pragma', 'public')
        res.setHeader('Content-Length', fs.statSync(filePath).size)

        // Send the file
        res.sendFile(filePath, (err) => {
            if (err) {
                console.error(err)
                res.status(500).send('Error sending file')
            }
        })
    })
}
