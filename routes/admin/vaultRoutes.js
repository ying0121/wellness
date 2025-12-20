
const fs = require("fs")
const path = require("path")
const multer = require("multer")

const { v4: uuidv4 } = require("uuid")

const express = require('express')
const router = express.Router()

const VaultController = require('../../controllers/admin/VaultController')

const Vault = require("../../models/Vault")

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, "../../public/assets/vault/")

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
const uploadDocument = multer({
  storage: storage,
  limits: { fileSize: 20480000 } // ~20 MB
}).single("document")

router.post('/read', VaultController.read)
router.post('/create', async (req, res) => {
  uploadDocument(req, res, async function (err) {
    if (err) {
      return res.status(400).json({ error: err.message })
    }

    try {
      const patient_id = req.body.patient_id
      const title = req.body.title
      const desc = req.body.desc
      const submit_date = new Date(Date.now())
      const document = req.file && req.file.filename ? req.file.filename : null

      await Vault.create({ patient_id, title, desc, submit_date, document })
      
      return res.json({ status: "success" })
    } catch (error) {
      return res.status(500).json({ error: "Internal server error" })
    }
  })
})
router.post('/choose', VaultController.choose)
router.post('/update', VaultController.update)
router.post('/delete', VaultController.delete)
router.post('/upload', async (req, res) => {
  uploadDocument(req, res, async function (err) {
    if (err) {
      return res.status(400).json({ error: err.message })
    }

    const id = req.body.id

    try {
      // Find the page image record
      const vault = await Vault.findOne({ where: { id: id } })
      if (!vault) {
        return res.status(200).json({ status: "error", error: "404" })
      }

      // Delete old file if exists
      if (vault.document) {
        const oldFilePath = path.join(__dirname, "../../public/assets/vault/", vault.document)
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath)
        }
      }

      vault.document = req.file.filename // update column dynamically
      await vault.save()

      return res.json({ status: "success" })
    } catch (error) {
      return res.status(500).json({ error: "Internal server error" })
    }
  })
})

router.post('/updateVaultDesc', VaultController.updateVaultDesc)
router.post('/updateLoginDesc', VaultController.updateLoginDesc)

router.get('/gf', VaultController.getFile)

module.exports = router
