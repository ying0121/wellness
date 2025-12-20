
const express = require('express')
const router = express.Router()
const multer = require('multer')
const path = require('path')
const fs = require('fs')

const { v4: uuidv4 } = require("uuid")

const TheClinicController = require('../../controllers/admin/TheClinicController')

const SocialMedia = require("../../models/SocialMedia")

// multers
const uploadSocialMediaImags = multer({
    dest: 'public/assets/images/social_media/', // Temporary storage
    limits: { fileSize: 20480000 }, // Limit file size to 20MB
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|gif/; // Allowed file types
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase())
        if (extname) {
            return cb(null, true)
        }
        cb(new Error('Invalid file type'))
    },
})
const uploadLogo = multer({
    dest: 'public/assets/images/', // Temporary storage
    limits: { fileSize: 20480000 }, // Limit file size to 20MB
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|gif/; // Allowed file types
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase())
        if (extname) {
            return cb(null, true)
        }
        cb(new Error('Invalid file type'))
    },
})

router.get('/', TheClinicController.render)

// working hours
router.get('/readWorkingHour', TheClinicController.readWorkingHour)
router.post('/createWorkingHour', TheClinicController.createWorkingHour)
router.post('/chooseWorkingHour', TheClinicController.chooseWorkingHour)
router.post('/updateWorkingHour', TheClinicController.updateWorkingHour)
router.post('/deleteWorkingHour', TheClinicController.deleteWorkingHour)

// social medias
router.get('/readSocialMedia', TheClinicController.readSocialMedia)
router.post('/createSocialMedia', TheClinicController.createSocialMedia)
router.post('/chooseSocialMedia', TheClinicController.chooseSocialMedia)
router.post('/updateSocialMedia', TheClinicController.updateSocialMedia)
router.post('/deleteSocialMedia', TheClinicController.deleteSocialMedia)
router.post('/uploadSocialMedia', uploadSocialMediaImags.single('img'), (req, res) => {
    try {
        const filename = uuidv4() + path.extname(req.file.originalname) // Generate a unique filename
        const tempPath = req.file.path
        const targetPath = path.join(__dirname, '../../public/assets/images/social_media/', filename)

        // Move the file to the target path
        fs.rename(tempPath, targetPath, async (err) => {
            if (err) return res.status(500).json({ status: "error", message: "Error moving file" })

            const id = req.body.id // Get the ID from the request body
            const chosen = await SocialMedia.findOne({ where: { id: id } }) // Fetch the existing record

            // Delete the old image if it's not the default
            if (chosen && chosen.img && chosen.img !== 'default.jpg') {
                fs.unlink(path.join(__dirname, '../../public/assets/images/social_media/', chosen.img), (err) => {
                    if (err) console.error('Error deleting old image:', err)
                })
            }

            // Update the record in the database
            chosen.img = filename // Update the image field
            await chosen.save() // Save the changes

            res.status(200).json({ status: "success" })
        })
    } catch (error) {
        res.status(500).json({ status: "error", message: "Failed to upload" })
    }
})

router.post('/updateAdditional', TheClinicController.updateAdditional)
router.post('/updateAfterHour', TheClinicController.updateAfterHour)
router.post('/updateContactInfo', TheClinicController.updateContactInfo)
router.get('/getQRCode', TheClinicController.getQRCode)

router.post('/uploadLogo', uploadLogo.single("img"), (req, res) => {
    const filename = req.body.filename // Get the filename from the request body
    const filePath = path.join(__dirname, '../../public/assets/images/', filename)
    
    // Delete the existing file
    fs.unlink(filePath, (err) => {
        if (err) {
            return res.status(200).json({ status: 'error', message: "failed in old file!" }) // Respond with error if file deletion fails
        } else {
            // Move the uploaded file to the target path
            const tempPath = req.file.path
            const targetPath = path.join(__dirname, '../../public/assets/images/', filename)

            fs.rename(tempPath, targetPath, (err) => {
                if (err) {
                    return res.status(200).json({ status: 'error', message: "failed in move" }) // Respond with error if moving fails
                }

                // Respond with success
                return res.status(200).json({ status: 'success' })
            })
        }
    })
})

module.exports = router