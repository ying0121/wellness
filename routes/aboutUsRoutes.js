const express = require('express')
const router = express.Router()
const AboutUsController = require('../controllers/AboutUsController')

router.get('/', AboutUsController.render)

module.exports = router