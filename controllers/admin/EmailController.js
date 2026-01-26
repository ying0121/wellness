const PatientList = require("../../models/PatientList")
const AreaToggle = require("../../models/AreaToggle")
const Translation = require("../../models/Translation")
const ContactInfo = require("../../models/ContactInfo")

const nodemailer = require("nodemailer")
const { Op } = require("sequelize")

const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    secure: false,
    pool: true,
    auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD,
    },
})

exports.render = async (req, res, next) => {
    let data = {}

    data.sideItem = "email"
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
    data.component = []
    _t.forEach(item => { 
        data.component[item.keyvalue] = []
        data.component[item.keyvalue].en = item.en
        data.component[item.keyvalue].es = item.es 
    })

    data.contact_info = await ContactInfo.findOne({ where: { id: 1 } })

    res.render('admin/email', data)
}

exports.sendEmails = async (req, res, next) => {
    try {
        const emails = req.body.emails.split(",")
        const subject = req.body.subject
        const body = req.body.body
        const mode = req.body.mode || 'text'

        if (!emails || emails.length === 0) {
            return res.status(400).json({ status: "error", message: "No email addresses provided" })
        }

        if (!subject || subject.trim() === '') {
            return res.status(400).json({ status: "error", message: "Email subject is required" })
        }

        if (!body || body.trim() === '') {
            return res.status(400).json({ status: "error", message: "Email body is required" })
        }

        const contactInfo = await ContactInfo.findOne({ where: { id: 1 } })
        const fromEmail = process.env.MAIL_USERNAME || contactInfo.email || 'noreply@theheightswellness.com'

        // Filter out empty emails
        const validEmails = emails.filter(email => email && email.trim() !== '')

        if (validEmails.length === 0) {
            return res.status(400).json({ status: "error", message: "No valid email addresses" })
        }

        // Send emails
        const emailPromises = validEmails.map(email => {
            const mailOptions = {
                from: `"The Heights Wellness" <${fromEmail}>`,
                to: email.trim(),
                subject: subject,
            }

            if (mode === 'html') {
                mailOptions.html = body
            } else {
                mailOptions.text = body
            }

            return transporter.sendMail(mailOptions).catch(err => {
                console.error(`Error sending email to ${email}:`, err)
                return { error: true, email: email, message: err.message }
            })
        })

        const results = await Promise.allSettled(emailPromises)
        
        const successful = results.filter(r => r.status === 'fulfilled' && !r.value.error).length
        const failed = results.filter(r => r.status === 'rejected' || (r.status === 'fulfilled' && r.value.error)).length

        return res.status(200).json({ 
            status: "success", 
            message: `Emails sent successfully`,
            successful: successful,
            failed: failed,
            total: validEmails.length
        })
    } catch (error) {
        console.error("Error in sendEmails:", error)
        return res.status(500).json({ status: "error", message: "Failed to send emails: " + error.message })
    }
}

exports.getPatients = async (req, res, next) => {
    try {
        const name = req.body.name || req.query.name || ''
        const email = req.body.email || req.query.email || ''
        const phone = req.body.phone || req.query.phone || ''
        const status = req.body.status !== undefined ? req.body.status : req.query.status

        // Build where clause
        const whereConditions = []

        // Status filter
        if (status !== undefined && status !== '') {
            whereConditions.push({ status: parseInt(status) })
        } else {
            whereConditions.push({ status: 1 }) // Default to active patients
        }

        // Name filter
        if (name && name.trim() !== '') {
            whereConditions.push({
                [Op.or]: [
                    { fname: { [Op.like]: `%${name}%` } },
                    { lname: { [Op.like]: `%${name}%` } },
                    { mname: { [Op.like]: `%${name}%` } }
                ]
            })
        }

        // Email filter
        if (email && email.trim() !== '') {
            whereConditions.push({ email: { [Op.like]: `%${email}%` } })
        }

        // Phone filter
        if (phone && phone.trim() !== '') {
            whereConditions.push({
                [Op.or]: [
                    { phone: { [Op.like]: `%${phone}%` } },
                    { mobile: { [Op.like]: `%${phone}%` } }
                ]
            })
        }

        const whereClause = whereConditions.length > 0 ? { [Op.and]: whereConditions } : {}

        const patients = await PatientList.findAll({
            attributes: ['id', 'patient_id', 'fname', 'lname', 'mname', 'email', 'phone', 'mobile', 'address', 'city', 'state', 'zip', 'dob', 'gender', 'language', 'ethnicity', 'race', 'status'],
            where: whereClause,
            order: [['createdAt', 'DESC']],
            raw: true // Return plain objects instead of Sequelize instances
        })

        // Ensure we return an array
        const patientsArray = Array.isArray(patients) ? patients : []
        return res.status(200).json(patientsArray)
    } catch (error) {
        console.error("Error in getPatients:", error)
        return res.status(500).json({ status: "error", message: "Failed to fetch patients: " + error.message })
    }
}
