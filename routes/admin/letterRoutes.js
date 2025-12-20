const express = require('express')
const router = express.Router()
const multer = require("multer")
const path = require("path")
const fs = require("fs")

const { v4: uuidv4 } = require("uuid")

const LetterController = require('../../controllers/admin/LetterController')

const Letters = require("../../models/Letters")

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const fileType = req.headers["x-file-type"]
    const uploadPath = path.join(__dirname, "../../public/assets/letter/" + fileType)

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
const uploadLetters = multer({
  storage: storage,
  limits: { fileSize: 20480000 } // ~20 MB
}).single("file")

router.get('/', LetterController.render)

router.post('/readLetterCategory', LetterController.readLetterCategory)
router.post('/addLetterCategory', LetterController.addLetterCategory)
router.post('/updateLetterCategory', LetterController.updateLetterCategory)
router.post('/chosenLetterCategory', LetterController.chosenLetterCategory)
router.post('/deleteLetterCategory', LetterController.deleteLetterCategory)

router.post('/readLetters', LetterController.readLetters)
router.post('/addLetters', LetterController.addLetters)
router.post('/updateLetters', LetterController.updateLetters)
router.post('/chosenLetters', LetterController.chosenLetters)
router.post('/deleteLetters', LetterController.deleteLetters)
router.post('/uploadLetterFile', (req, res) => {
    uploadLetters(req, res, async function (err) {
        if (err) {
            return res.status(400).json({ error: err.message })
        }

        const fileType = req.body.type
        const id = req.body.id

        try {
            // Find the letter record
            const letter = await Letters.findOne({ where: { id: id } })
            if (!letter) {
                return res.status(200).json({ status: "error", error: "404" })
            }

            // Delete old file if exists
            if (letter[fileType]) {
                const oldFilePath = path.join(__dirname, "../../public/assets/letter/", fileType, letter[fileType])
                if (fs.existsSync(oldFilePath)) {
                    fs.unlinkSync(oldFilePath)
                }
            }

            // Update DB with new file
            const fileName = req.file.filename // stored name

            letter[fileType] = fileName // update column dynamically
            await letter.save()

            return res.json({ status: "success" })

        } catch (error) {
            return res.status(500).json({ error: "Internal server error" })
        }
    })
})

router.post('/getLetterDescription', LetterController.getLetterDescription)
router.post('/updateLetterDescription', LetterController.updateLetterDescription)

module.exports = router