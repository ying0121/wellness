const express = require('express')
const router = express.Router()
const multer = require('multer')
const path = require('path')
const fs = require('fs')

const { v4: uuidv4 } = require("uuid")

const OrientationController = require('../../controllers/admin/OrientationController')

const Document = require("../../models/Document")

// multers
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, "../../public/assets/documents"))
    },
    filename: (req, file, cb) => {
        let prefix = file.fieldname === "enfile" ? "en_" : "es_"
        cb(null, prefix + uuidv4() + path.extname(file.originalname))
    },
})
const uploadDocument = multer({
    storage,
    limits: { fileSize: 20480000 }, // ~20MB
}).fields([
    { name: "enfile", maxCount: 1 },
    { name: "esfile", maxCount: 1 },
])

router.get('/', OrientationController.render)

router.get('/read', OrientationController.read)
router.post('/create', OrientationController.create)
router.post('/choose', OrientationController.choose)
router.post('/update', OrientationController.update)
router.post('/delete', OrientationController.delete)
router.post('/uploadDocument', async (req, res) => {
    uploadDocument(req, res, async (err) => {
        if (err) return res.status(400).json({ error: err.message })

        try {
            const id = req.body.id

            // Fetch current document row
            const chosen = await Document.findOne({ where: { id: id } })
            if (!chosen) return res.status(404).json({ status: "error", message: "Document not found" })

            let enfile = null, esfile = null, en_size = null, es_size = null

            // English file
            if (req.files["enfile"]) {
                const file = req.files["enfile"][0]
                enfile = file.filename
                en_size = (file.size / 1024).toFixed(2) + " KB"

                // Remove old file
                if (chosen.en_doc) {
                    fs.unlink(path.join(__dirname, "../../public/assets/documents", chosen.en_doc), (e) => {})
                }
            }

            // Spanish file
            if (req.files["esfile"]) {
                const file = req.files["esfile"][0]
                esfile = file.filename
                es_size = (file.size / 1024).toFixed(2) + " KB"

                // Remove old file
                if (chosen.es_doc) {
                    fs.unlink(path.join(__dirname, "../../public/assets/documents", chosen.es_doc), (e) => {})
                }
            }

            // Update DB with Sequelize
            await chosen.update({
                en_doc: enfile || chosen.en_doc,
                es_doc: esfile || chosen.es_doc,
                en_size: en_size || chosen.en_size,
                es_size: es_size || chosen.es_size,
            })

            return res.status(200).json({ status: "success" })
        } catch (error) {
            res.status(500).json({ status: "error", message: "Server error" })
        }
    })
})

router.post('/updateOrientationDesc', OrientationController.updateOrientationDesc)

module.exports = router