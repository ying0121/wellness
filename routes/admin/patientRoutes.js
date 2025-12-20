
const express = require('express')
const router = express.Router()

const PatientController = require('../../controllers/admin/PatientController')

router.get('/read', PatientController.read)
router.post('/create', PatientController.create)
router.post('/choose', PatientController.choose)
router.post('/update', PatientController.update)
router.post('/delete', PatientController.delete)

router.post('/reset-pwd', PatientController.resetPassword)
router.post('/addPatients', PatientController.addPatients)
router.post('/filter', PatientController.filter)

module.exports = router
