
const fs = require("fs")
const path = require("path")
const multer = require("multer")

const { v4: uuidv4 } = require("uuid")

const express = require('express')
const router = express.Router()

const PageImageController = require('../../controllers/admin/PageImageController')

const PageImg = require("../../models/PageImg")

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, "../../public/assets/images/pageimgs/")

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

router.get('/', PageImageController.render)

router.post('/create', PageImageController.create)
router.post('/update', PageImageController.update)
router.post('/read', PageImageController.read)
router.post('/choose', PageImageController.choose)
router.post('/delete', PageImageController.delete)
router.post('/upload', async (req, res) => {
  uploadImage(req, res, async function (err) {
    if (err) {
      return res.status(400).json({ error: err.message })
    }

    const id = req.body.id

    try {
      // Find the page image record
      const pageImage = await PageImg.findOne({ where: { id: id } })
      if (!pageImage) {
        return res.status(200).json({ status: "error", error: "404" })
      }

      // Delete old file if exists
      if (pageImage.img) {
        const oldFilePath = path.join(__dirname, "../../public/assets/images/pageimgs/", pageImage.img)
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath)
        }
      }

      // Update DB with new file
      const fileName = req.file.filename // stored name

      pageImage.img = fileName // update column dynamically
      await pageImage.save()

      return res.json({ status: "success" })

    } catch (error) {
      return res.status(500).json({ error: "Internal server error" })
    }
  })
})

module.exports = router