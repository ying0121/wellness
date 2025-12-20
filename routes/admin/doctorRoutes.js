
const fs = require("fs")
const path = require("path")
const multer = require("multer")

const { v4: uuidv4 } = require("uuid")

const express = require('express')
const router = express.Router()

const DoctorController = require('../../controllers/admin/DoctorController')

const Doctor = require("../../models/Doctor")

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, "../../public/assets/images/doctors/")

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

router.get('/', DoctorController.render)

router.get('/read', DoctorController.read)
router.post('/create', DoctorController.create)
router.post('/choose', DoctorController.choose)
router.post('/update', DoctorController.update)
router.post('/delete', DoctorController.delete)

router.post('/updateDoctorDesc', DoctorController.updateDoctorDesc)

router.post('/uploadImg', async (req, res) => {
  uploadImage(req, res, async function (err) {
    if (err) {
      return res.status(400).json({ error: err.message })
    }

    const id = req.body.id

    try {
      // Find the doctor record
      const doctor = await Doctor.findOne({ where: { id: id } })
      if (!doctor) {
        return res.status(200).json({ status: "error", error: "404" })
      }

      // Delete old file if exists
      if (doctor.img) {
        const oldFilePath = path.join(__dirname, "../../public/assets/images/doctors/", doctor.img)
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath)
        }
      }

      // Update DB with new file
      const fileName = req.file.filename // stored name

      doctor.img = fileName // update column dynamically
      await doctor.save()

      return res.json({ status: "success" })

    } catch (error) {
      return res.status(500).json({ error: "Internal server error" })
    }
  })
})

module.exports = router