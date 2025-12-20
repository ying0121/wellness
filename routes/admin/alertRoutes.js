
const fs = require('fs')
const path = require('path')
const multer = require('multer')

const { v4: uuidv4 } = require("uuid")

const express = require('express')
const router = express.Router()

const AlertController = require('../../controllers/admin/AlertController')

const AlertClinic = require("../../models/AlertClinic")

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, "../../public/assets/images/alerts/")

    // create folder if not exists
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true })
    }

    cb(null, uploadPath)
  },
  filename: function (req, file, cb) {
    const randomName = uuidv4() + path.extname(file.originalname)
    cb(null, randomName)
  }
})
const uploadImage = multer({
  storage: storage,
  limits: { fileSize: 20480000 } // ~20 MB
}).single("img")

router.get('/', AlertController.render)

router.get('/read', AlertController.read)
router.post('/create', async (req, res) => {
    uploadImage(req, res, async function (err) {
        if (err) {
            return res.status(400).json({ error: err.message })
        }

        const title = req.body.title
        const message = req.body.message
        const description = req.body.description
        const title_es = req.body.title_es
        const message_es = req.body.message_es
        const description_es = req.body.description_es
        const start = req.body.start
        const end = req.body.end
        const status = req.body.status
        const type = req.body.type
        const created_by = req.body.created_by
        const image_actived = req.body.image_actived
        const image = req.file && req.file.filename ? req.file.filename : ""

        try {
            await AlertClinic.create({ title, message, description, title_es, message_es, description_es, start, end, status, type, created_by, image_actived, image })

            return res.json({ status: "success" })
        } catch (error) {
            return res.status(500).json({ error: "Internal server error" })
        }
    })
})
router.post('/update', async (req, res) => {
    uploadImage(req, res, async function (err) {
        if (err) {
            return res.status(400).json({ error: err.message })
        }

        const id = req.body.id

        try {
            // Find the alert record
            const alert = await AlertClinic.findOne({ where: { id: id } })
            if (!alert) {
                return res.status(200).json({ status: "error", error: "404" })
            }

            const title = req.body.title
            const message = req.body.message
            const description = req.body.description
            const title_es = req.body.title_es
            const message_es = req.body.message_es
            const description_es = req.body.description_es
            const start = req.body.start
            const end = req.body.end
            const status = req.body.status
            const type = req.body.type
            const created_by = req.body.created_by
            const image_actived = req.body.image_actived
            const image = req.file && req.file.filename ? req.file.filename : alert.image

            // Delete old file if exists
            if (alert.image && req.file && req.file.filename) {
                const oldFilePath = path.join(__dirname, "../../public/assets/images/alerts/", alert.image)
                if (fs.existsSync(oldFilePath)) {
                fs.unlinkSync(oldFilePath)
                }
            }

            // Update DB with new file
            await AlertClinic.update({ title, message, description, title_es, message_es, description_es, start, end, status, type, created_by, image_actived, image }, { where: { id: id } })

            return res.json({ status: "success" })
        } catch (error) {
            return res.status(500).json({ error: "Internal server error" })
        }
    })
})
router.post('/chosen', AlertController.chosen)
router.post('/delete', AlertController.delete)

module.exports = router