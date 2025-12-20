
const fs = require("fs")
const path = require("path")

const Translation = require("../../models/Translation")
const Vault = require("../../models/Vault")
const PatientList = require("../../models/PatientList")

const { Sequelize } = require("sequelize")

exports.read = async (req, res, next) => {
    const vaults = await Vault.findAll({
        attributes: [
            'id', 'patient_id', 'title', 'desc', 'document', 'submit_date',
            [Sequelize.col('patient.fname'), 'fname'],
            [Sequelize.col('patient.lname'), 'lname'],
            [Sequelize.col('patient.mname'), 'mname'],
         ],
        include: [{
            model: PatientList,
            as: "patient",
            attributes: ['fname', 'mname', 'lname'],
            where: {
                id: Sequelize.col('vaults.patient_id')
            }
        }]
    })

    res.status(200).json({ data: vaults })
}
exports.choose = async (req, res, next) => {
    const id = req.body.id
    
    const vault = await Vault.findOne({ where: { id: id } })

    res.status(200).json(vault)
}
exports.update = async (req, res, next) => {
    const id = req.body.id
    const patient_id = req.body.patient_id
    const title = req.body.title
    const desc = req.body.desc

    await Vault.update({ patient_id, title, desc }, { where: { id: id } })

    res.status(200).json({ status: "success" })
}
exports.delete = async (req, res, next) => {
    const id = req.body.id

    const choose = await Vault.findOne({ where: { id: id } })

    if (choose.document) {
        fs.unlink(path.join(__dirname, '../../public/assets/vault/', choose.document), (err) => { })
    }
    
    await Vault.destroy({ where: { id: id } })

    res.status(200).json({ status: "success" })
}

exports.updateVaultDesc = async (req, res, next) => {
    const title_en = req.body.title_en
    const title_es = req.body.title_es
    const desc_en = req.body.desc_en
    const desc_es = req.body.desc_es

    await Translation.update({ en: title_en, es: title_es }, { where: { keyvalue: "t_vault_title" } })
    await Translation.update({ en: desc_en, es: desc_es }, { where: { keyvalue: "t_vault_desc" } })

    res.status(200).json({ status: "success" })
}

exports.updateLoginDesc = async (req, res, next) => {
    const title_en = req.body.title_en
    const title_es = req.body.title_es
    const desc_en = req.body.desc_en
    const desc_es = req.body.desc_es
    const footer_en = req.body.footer_en
    const footer_es = req.body.footer_es

    await Translation.update({ en: title_en, es: title_es }, { where: { keyvalue: "t_vault_login_title" } })
    await Translation.update({ en: desc_en, es: desc_es }, { where: { keyvalue: "t_vault_login_desc" } })
    await Translation.update({ en: footer_en, es: footer_es }, { where: { keyvalue: "t_vault_login_footer" } })

    res.status(200).json({ status: "success" })
}

exports.getFile = async (req, res, next) => {
    const filepath = path.join(__dirname, "../../public/assets/" + req.query.category, req.query.filename)
    fs.access(filepath, fs.constants.F_OK | fs.constants.R_OK, (err) => {
        if (err) {
            return res.status(404).send("File not found or not readable!")
        } else {
            const getMimeType = filePath => {
                const mime = require('mime-types')
                return mime.lookup(filePath) || 'application/octet-stream'
            }

            res.setHeader('Content-Description', 'File Transfer')
            res.setHeader('Content-Type', getMimeType(filepath))
            res.setHeader('Content-Disposition', 'attachment; filename="' + path.basename(filepath) + '"')
            res.setHeader('Expires', 0)
            res.setHeader('Cache-Control', 'must-revalidate')
            res.setHeader('Pragma', 'public')
            res.setHeader('Content-Length', fs.statSync(filepath).size)

            const fileStream = fs.createReadStream(filepath)
            fileStream.pipe(res)

            return res.status(200).send("")
        }
    })
}
