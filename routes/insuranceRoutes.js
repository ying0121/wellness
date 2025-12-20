const express = require('express')
const router = express.Router()
const InsuranceController = require('../controllers/InsuranceController')

router.get('/', InsuranceController.render)

module.exports = router