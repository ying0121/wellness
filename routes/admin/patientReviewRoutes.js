
const fs = require("fs")
const path = require("path")
const multer = require("multer")

const { v4: uuidv4 } = require("uuid")

const express = require('express')
const router = express.Router()

const PatientReviewController = require('../../controllers/admin/PatientReviewController')

const PatientReview = require("../../models/PatientReview")

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, "../../public/assets/images/patient_review/")

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

router.get('/', PatientReviewController.render)

router.get('/read', PatientReviewController.read)
router.post('/create', PatientReviewController.create)
router.post('/choose', PatientReviewController.choose)
router.post('/update', PatientReviewController.update)
router.post('/delete', PatientReviewController.delete)

router.post('/uploadImg', async (req, res) => {
  uploadImage(req, res, async function (err) {
    if (err) {
      return res.status(400).json({ error: err.message })
    }

    const id = req.body.id

    try {
      // Find the patientReview record
      const patientReview = await PatientReview.findOne({ where: { id: id } })
      if (!patientReview) {
        return res.status(200).json({ status: "error", error: "404" })
      }

      // Delete old file if exists
      if (patientReview.img) {
        const oldFilePath = path.join(__dirname, "../../public/assets/images/patient_review/", patientReview.img)
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath)
        }
      }

      // Update DB with new file
      const fileName = req.file.filename // stored name

      patientReview.img = fileName // update column dynamically
      await patientReview.save()

      return res.json({ status: "success" })

    } catch (error) {
      return res.status(500).json({ error: "Internal server error" })
    }
  })
})

module.exports = router