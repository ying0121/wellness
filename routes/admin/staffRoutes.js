
const fs = require("fs")
const path = require("path")
const multer = require("multer")

const { v4: uuidv4 } = require("uuid")

const express = require('express')
const router = express.Router()

const StaffController = require('../../controllers/admin/StaffController')

const Staff = require("../../models/Staff")

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, "../../public/assets/images/staffs/")

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

router.get('/', StaffController.render)

router.get('/read', StaffController.read)
router.post('/create', StaffController.create)
router.post('/choose', StaffController.choose)
router.post('/update', StaffController.update)
router.post('/delete', StaffController.delete)

router.post('/updateStaffDesc', StaffController.updateStaffDesc)

router.post('/uploadImg', async (req, res) => {
  uploadImage(req, res, async function (err) {
    if (err) {
      return res.status(400).json({ error: err.message })
    }

    const id = req.body.id

    try {
      // Find the staff record
      const staff = await Staff.findOne({ where: { id: id } })
      if (!staff) {
        return res.status(200).json({ status: "error", error: "404" })
      }

      // Delete old file if exists
      if (staff.img) {
        const oldFilePath = path.join(__dirname, "../../public/assets/images/staffs/", staff.img)
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath)
        }
      }

      // Update DB with new file
      const fileName = req.file.filename // stored name

      staff.img = fileName // update column dynamically
      await staff.save()

      return res.json({ status: "success" })

    } catch (error) {
      return res.status(500).json({ error: "Internal server error" })
    }
  })
})

module.exports = router