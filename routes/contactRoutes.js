const express = require('express')
const router = express.Router()
const ContactController = require('../controllers/ContactController')

router.get('/', ContactController.render)

module.exports = router