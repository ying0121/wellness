const express = require('express')
const router = express.Router()

const LanguageController = require('../../controllers/admin/LanguageController')

router.post('/read', LanguageController.read)

module.exports = router