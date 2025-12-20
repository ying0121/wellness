
const md5 = require("md5")

const PatientList = require("../../models/PatientList")
const { Op } = require("sequelize")

exports.read = async (req, res, next) => {
    const order = req.query.order
    const search = req.query.search
    const start = req.query.start
    const length = req.query.length

    const total = await PatientList.count({
        where: {
            [Op.or]: [
                { id: { [Op.like]: `%${search.value}%` } },
                { fname: { [Op.like]: `%${search.value}%` } },
                { lname: { [Op.like]: `%${search.value}%` } },
                { phone: { [Op.like]: `%${search.value}%` } },
                { mobile: { [Op.like]: `%${search.value}%` } },
                { email: { [Op.like]: `%${search.value}%` } },
                { address: { [Op.like]: `%${search.value}%` } }
            ]
        }
    })

    const patients = await PatientList.findAll({
        where: {
            [Op.or]: [
                { id: { [Op.like]: `%${search.value}%` } },
                { fname: { [Op.like]: `%${search.value}%` } },
                { lname: { [Op.like]: `%${search.value}%` } },
                { phone: { [Op.like]: `%${search.value}%` } },
                { mobile: { [Op.like]: `%${search.value}%` } },
                { email: { [Op.like]: `%${search.value}%` } },
                { address: { [Op.like]: `%${search.value}%` } }
            ]
        },
        order: [
            order[0].column === 0 ? ['id', order[0].dir] :
            order[0].column === 1 ? ['fname', order[0].dir] :
            order[0].column === 2 ? ['phone', order[0].dir] :
            order[0].column === 3 ? ['email', order[0].dir] :
            order[0].column === 4 ? ['address', order[0].dir] :
            order[0].column === 5 ? ['dob', order[0].dir] :
            ['id', 'ASC'] // Default order if no match
        ],
        limit: parseInt(length),
        offset: parseInt(start)
    })

    res.status(200).json({ data: patients, recordsFiltered: total, recordsTotal: total })
}
exports.create = async (req, res, next) => {
    const patient_id = req.body.patient_id
    const fname = req.body.fname
    const lname = req.body.lname

    // check if is existed
    const patient = await PatientList.findOne({ where: { patient_id: patient_id } })
    if (patient) {
        return res.status(200).json({ status: "existed" })
    } else {
        await PatientList.create({ patient_id: patient_id, fname: fname, lname, lname })
        return res.status(200).json({ status: "success" })
    }
}
exports.choose = async (req, res, next) => {
	const id = req.body.id

    const patient = await PatientList.findOne({ where: { id: id } })

    res.status(200).json(patient)
}
exports.update = async (req, res, next) => {
    const id = req.body.id
    const patient_id = req.body.patient_id
    const fname = req.body.fname
    const lname = req.body.lname
    const mname = req.body.mname
    const phone = req.body.phone
    const mobile = req.body.mobile
    const email = req.body.email
    const address = req.body.address
    const city = req.body.city
    const state = req.body.state
    const zip = req.body.zip
    const gender = req.body.gender
    const dob = req.body.dob ? new Date(req.body.dob) : null
    const language =req.body.language
    const ethnicity = req.body.ethnicity
    const race = req.body.race
    const status = req.body.status

    // check if the patient id is already existed
    const patientForID = await PatientList.findAll({ where: { patient_id: patient_id, id: { [Op.ne]: id } } })
    if (patientForID.length) {
        return res.status(200).json({ status: "existed", error: "id" })
    }

    // check if the email is already is existed
    const patientForEmail = await PatientList.findAll({ where: { email: email, id: { [Op.ne]: id } } })
    if (patientForEmail.length) {
        return res.status(200).json({ status: "existed", error: "email" })
    }

    // update
    await PatientList.update({ patient_id, fname, mname, lname, phone, mobile, email, address, city, state, zip, gender, dob, language, ethnicity, race, status }, { where: { id: id } })

    res.status(200).json({ status: "success" })
}
exports.delete = async (req, res, next) => {
    const id = req.body.id

    await PatientList.destroy({ where: { id: id } })

    res.status(200).json({ status: "success" })
}

exports.resetPassword = async (req, res, next) => {
    const id = req.body.id
    const password = req.body.pwd

    await PatientList.update({ password: md5(password) }, { where: { id: id } })

    res.status(200).json({ status: "success" })
}

exports.addPatients = async (req, res, next) => {
    const url = req.body.url

    const requestData = {
        all: true,
        client_id: 10
    }
    try {
        const response = await axios.post(url, requestData, { timeout: 600 })
        
        await PatientList.bulkCreate(response.data, { validate: true, ignoreDuplicates: true })
    } catch (error) {
    }

    res.status(200).json({ status: "success" })
}

exports.filter = async (req, res, next) => {
    const value = req.body.value

    const patients = await PatientList.findAll({
        attributes: ['id', 'fname', 'lname', 'dob', 'email', 'phone'],
        where: {
            [Op.or]: [
                { id: { [Op.like]: `%${value}%` } },
                { fname: { [Op.like]: `%${value}%` } },
                { lname: { [Op.like]: `%${value}%` } },
                { dob: { [Op.like]: `%${value}%` } },
                { email: { [Op.like]: `%${value}%` } },
                { phone: { [Op.like]: `%${value}%` } }
            ]
        }
    })

    res.status(200).json(patients)
}
