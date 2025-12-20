const express = require('express')
const router = express.Router()
const PatientAreaController = require('../../controllers/admin/PatientAreaController')

router.get('/', PatientAreaController.render)

router.post('/getReports', PatientAreaController.getReports)

module.exports = router