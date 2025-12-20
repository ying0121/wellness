
const fs = require('fs')
const path = require('path')
const multer = require('multer')

const { v4: uuidv4 } = require("uuid")

const express = require('express')
const router = express.Router()

const EducationController = require('../../controllers/admin/EducationController')

const EducationDoc = require("../../models/EducationDoc")

// multers
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, "../../public/assets/education"))
    },
    filename: (req, file, cb) => {
        cb(null, uuidv4() + path.extname(file.originalname))
    },
})
const uploadDocument = multer({
    storage,
    limits: { fileSize: 20480000 }, // ~20MB
}).fields([
    { name: "file_en", maxCount: 1 },
    { name: "file_es", maxCount: 1 },
])

router.get('/', EducationController.render)

router.post('/readVideo', EducationController.readVideo)
router.post('/addVideo', EducationController.addVideo)
router.post('/updateVideo', EducationController.updateVideo)
router.post('/deleteVideo', EducationController.deleteVideo)
router.post('/readVideoById', EducationController.readVideoById)

router.post('/readDocument', EducationController.readDocument)
router.post('/addDocument', EducationController.addDocument)
router.post('/updateDocument', EducationController.updateDocument)
router.post('/deleteDocument', EducationController.deleteDocument)
router.post('/readDocumentById', EducationController.readDocumentById)

router.post('/uploadFiles', async (req, res) => {
    uploadDocument(req, res, async (err) => {
        if (err) return res.status(400).json({ error: err.message })

        try {
            const id = req.body.id

            // Fetch current document row
            const chosen = await EducationDoc.findOne({ where: { id: id } })
            if (!chosen) return res.status(404).json({ status: "error", message: "Document not found" })

            let enfile = null, esfile = null

            // English file
            if (req.files["file_en"]) {
                const file = req.files["file_en"][0]
                enfile = file.filename

                // Remove old file
                if (chosen.url_en) {
                    fs.unlink(path.join(__dirname, "../../public/assets/education", chosen.url_en), () => {})
                }
            }

            // Spanish file
            if (req.files["file_es"]) {
                const file = req.files["file_es"][0]
                esfile = file.filename

                // Remove old file
                if (chosen.url_es) {
                    fs.unlink(path.join(__dirname, "../../public/assets/education", chosen.url_es), () => {})
                }
            }

            // Update DB with Sequelize
            await chosen.update({
                url_en: enfile || chosen.url_en,
                url_es: esfile || chosen.url_es,
            })

            return res.status(200).json({ status: "success" })
        } catch (error) {
            res.status(500).json({ status: "error", message: "Server error" })
        }
    })
})

module.exports = router