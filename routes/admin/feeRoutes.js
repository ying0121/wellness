const express = require('express')
const router = express.Router()
const multer = require("multer")
const path = require("path")
const fs = require("fs")

const { v4: uuidv4 } = require("uuid")

const FeeController = require('../../controllers/admin/FeeController')

// Fee model is just ClinicService model
const ClinicService = require("../../models/ClinicService")

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const fileType = req.headers["x-file-type"]
    const uploadPath = path.join(__dirname, "../../public/assets/service/" + fileType)

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
const uploadFee = multer({
  storage: storage,
  limits: { fileSize: 20480000 } // ~20 MB
}).single("file")

router.get('/', FeeController.render)

router.post('/getFee', FeeController.getFee)
router.post('/addFee', FeeController.addFee)
router.post('/updateFee', FeeController.updateFee)
router.post('/chosenFee', FeeController.chosenFee)
router.post('/deleteFee', FeeController.deleteFee)
router.post('/uploadFeeFile', (req, res) => {
    uploadFee(req, res, async function (err) {
        if (err) {
            return res.status(400).json({ error: err.message })
        }

        const fileType = req.body.type
        const id = req.body.id

        try {
            // Find the fee record
            const fee = await ClinicService.findOne({ where: { id: id } })
            if (!fee) {
                return res.status(200).json({ status: "error", error: "404" })
            }

            // Delete old file if exists
            if (fee[fileType]) {
                const oldFilePath = path.join(__dirname, "../../public/assets/service/", fileType, fee[fileType])
                if (fs.existsSync(oldFilePath)) {
                    fs.unlinkSync(oldFilePath)
                }
            }

            // Update DB with new file
            const fileName = req.file.filename // stored name

            fee[fileType] = fileName // update column dynamically
            await fee.save()

            return res.json({ status: "success" })

        } catch (error) {
            return res.status(500).json({ error: "Internal server error" })
        }
    })
})

router.post('/getMetaInfo', FeeController.getMetaInfo)
router.post('/updateMetaInfo', FeeController.updateMetaInfo)

module.exports = router