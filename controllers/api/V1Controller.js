
const md5 = require("md5")
const jwt = require("jsonwebtoken")

const { Op, Sequelize } = require('sequelize')

const PatientList = require('../../models/PatientList')
const Managers = require('../../models/Managers')

/** Returns only digits from a string (for normalizing phone before compare). */
const digitsOnly = s => (String(s || '').replace(/\D/g, ''))

/** Normalize a date string to YYYY-MM-DD (for param and DB comparison). Accepts YYYY-MM-DD and other parseable date strings. */
function dobToYYYYMMDD(s) {
    const str = String(s || '').trim()
    if (!str) return null
    if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str
    const d = new Date(str)
    if (Number.isNaN(d.getTime())) return null
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
}

exports.helloWorld = async (req, res, next) => {
    res.status(200).json({ status: 'success', message: 'Hello World!' })
}

exports.auth = async (req, res, next) => {
    const { email, password } = req.body
    try {
        const patient = await Managers.findOne({ where: { email: email, password: md5(password) } })
        if (patient) {
            if (patient.status === 0) {
                return res.status(401).json({ status: 'error', message: 'Account is not active' })
            }
            // generate token
            const token = jwt.sign({ id: patient.id, email: patient.email, fname: patient.fname, lname: patient.lname }, process.env.JWT_SECRET, { expiresIn: '1h' })

            return res.status(200).json({ status: 'success', token: token })
        } else {
            return res.status(401).json({ status: 'error', message: 'Invalid email or password' })
        }
    } catch (error) {
        return res.status(500).json({ status: 'error', message: error.message })
    }
}

exports.getPatient = async (req, res, next) => {
    const { patient_id, fname, lname, email, phone, dob } = req.query
    try {
        const attributes = ['patient_id', 'fname', 'mname', 'lname', 'email', 'phone', 'mobile', 'address', 'city', 'state', 'zip', 'gender', 'dob', 'language', 'ethnicity', 'race']
        
        let where = {}
        if (patient_id) {
            where.patient_id = patient_id
        }
        if (fname) {
            where.fname = { [Op.like]: `%${fname}%` }
        }
        if (lname) {
            where.lname = { [Op.like]: `%${lname}%` }
        }
        if (email) {
            where.email = { [Op.like]: `%${email}%` }
        }
        if (phone) {
            const phoneDigits = digitsOnly(phone)
            if (phoneDigits) {
                // Compare digits-only on both phone and mobile (handles any phone format)
                const digitsLike = { [Op.like]: `%${phoneDigits}%` }
                where[Op.or] = [
                    Sequelize.where(
                        Sequelize.fn('REGEXP_REPLACE', Sequelize.col('phone'), '[^0-9]', ''),
                        digitsLike
                    ),
                    Sequelize.where(
                        Sequelize.fn('REGEXP_REPLACE', Sequelize.col('mobile'), '[^0-9]', ''),
                        digitsLike
                    )
                ]
            }
        }
        if (dob) {
            const dobNormalized = dobToYYYYMMDD(dob)
            if (dobNormalized) {
                // Compare as YYYY-MM-DD on both sides (DB field formatted to YYYY-MM-DD, param normalized)
                where.dob = Sequelize.where(
                    Sequelize.fn('DATE_FORMAT', Sequelize.col('dob'), '%Y-%m-%d'),
                    dobNormalized
                )
            }
        }

        const patients = await PatientList.findAll({ attributes: attributes, where: where })
        return res.status(200).json({ status: 'success', data: patients })
    } catch (error) {
        return res.status(500).json({ status: 'error', message: error.message })
    }
}
