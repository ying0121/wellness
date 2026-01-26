const express = require('express')
const router = express.Router()
const EmailController = require('../../controllers/admin/EmailController')

router.get('/', EmailController.render)
router.post('/send', EmailController.sendEmails)
router.post('/gp', EmailController.getPatients)

module.exports = router
