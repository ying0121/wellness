
const fs = require("fs")
const path = require("path")
const multer = require("multer")

const { v4: uuidv4 } = require("uuid")

const express = require('express')
const router = express.Router()

const NewsletterController = require('../../controllers/admin/NewsletterController')

const NewsletterImage = require("../../models/NewsletterImage")

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, "../../public/assets/images/newsimg/")

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
}).single("image")

router.get('/', NewsletterController.render)
router.get('/view', NewsletterController.renderView)

router.post('/geti', NewsletterController.getImage)
router.post('/addi', async (req, res) => {
  uploadImage(req, res, async function (err) {
    if (err) {
      return res.status(400).json({ error: err.message })
    }

    try {
      await NewsletterImage.create({
        name: req.body.name,
        image: req.file.filename,
        status: 1
      })
      
    return res.json({ status: "success" })

    } catch (error) {
      return res.status(500).json({ error: "Internal server error" })
    }
  })
})
router.post('/deletei', NewsletterController.deleteImage)

router.post('/getd', NewsletterController.getData)
router.post('/updated', NewsletterController.updateData)
router.post('/addd', NewsletterController.addData)
router.post('/deleted', NewsletterController.deleteData)
router.post('/setdi', NewsletterController.setDataImage)
router.post('/sendee', NewsletterController.sendDataEmailMonth)
router.post('/sendsm', NewsletterController.sendDataSMSMonth)

router.post('/getem', NewsletterController.getEducationMaterial)

module.exports = router
