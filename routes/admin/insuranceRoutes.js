const express = require('express')
const router = express.Router()

const InsuranceController = require('../../controllers/admin/InsuranceController')

router.get('/', InsuranceController.render)

router.post('/updateInsuranceDesc', InsuranceController.updateInsuranceDesc)

module.exports = router