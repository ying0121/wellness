const express = require('express')
const router = express.Router()
const ContactController = require('../../controllers/admin/ContactController')

router.get('/', ContactController.render)

router.post('/updateContactDesc', ContactController.updateContactDesc)
router.post('/getAllContacts', ContactController.getAllContacts)
router.post('/viewContact', ContactController.viewContact)
router.post('/viewCommunicationHistory', ContactController.viewCommunicationHistory)
router.post('/deleteContact', ContactController.deleteContact)
router.post('/updateTrack', ContactController.updateTrack)
router.post('/addMessage', ContactController.addMessage)

module.exports = router