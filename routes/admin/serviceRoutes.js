const express = require('express')
const router = express.Router()
const multer = require("multer")
const path = require("path")
const fs = require("fs")

const { v4: uuidv4 } = require("uuid")

const ServiceController = require('../../controllers/admin/ServiceController')

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
const uploadClinicService = multer({
  storage: storage,
  limits: { fileSize: 20480000 } // ~20 MB
}).single("file")

router.get('/', ServiceController.render)

router.post('/getServiceCategory', ServiceController.getServiceCategory)
router.post('/addServiceCategory', ServiceController.addServiceCategory)
router.post('/updateServiceCategory', ServiceController.updateServiceCategory)
router.post('/chosenServiceCategory', ServiceController.chosenServiceCategory)
router.post('/deleteServiceCategory', ServiceController.deleteServiceCategory)

router.post('/getClinicService', ServiceController.getClinicService)
router.post('/addClinicService', ServiceController.addClinicService)
router.post('/updateClinicService', ServiceController.updateClinicService)
router.post('/chosenClinicService', ServiceController.chosenClinicService)
router.post('/deleteClinicService', ServiceController.deleteClinicService)
router.post('/uploadServiceFile', (req, res) => {
    uploadClinicService(req, res, async function (err) {
        if (err) {
            return res.status(400).json({ error: err.message })
        }

        const fileType = req.body.type
        const id = req.body.id

        try {
            // Find the service record
            const service = await ClinicService.findOne({ where: { id: id } })
            if (!service) {
                return res.status(200).json({ status: "error", error: "404" })
            }

            // Delete old file if exists
            if (service[fileType]) {
                const oldFilePath = path.join(__dirname, "../../public/assets/service/", fileType, service[fileType])
                if (fs.existsSync(oldFilePath)) {
                    fs.unlinkSync(oldFilePath)
                }
            }

            // Update DB with new file
            const fileName = req.file.filename // stored name

            service[fileType] = fileName // update column dynamically
            await service.save()

            return res.json({ status: "success" })

        } catch (error) {
            return res.status(500).json({ error: "Internal server error" })
        }
    })
})

router.post('/getDesc', ServiceController.getDesc)
router.post('/updateDesc', ServiceController.updateDesc)

router.get('/getServiceCategory', ServiceController.getServiceCategory)

module.exports = router