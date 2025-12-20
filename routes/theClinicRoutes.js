const express = require('express')
const router = express.Router()
const TheClinicController = require('../controllers/TheClinicController')

router.get('/', TheClinicController.render)

module.exports = router