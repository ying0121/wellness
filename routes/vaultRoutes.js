const express = require('express')
const router = express.Router()
const VaultController = require('../controllers/VaultController')

router.get('/', VaultController.render)
router.post('/getContacts', VaultController.getContacts)
router.post('/updatePatient', VaultController.updatePatient)
router.post('/resetPassword', VaultController.resetPassword)
router.post('/viewCommunicationHistory', VaultController.viewCommunicationHistory)
router.post('/addMessage', VaultController.addMessage)

module.exports = router