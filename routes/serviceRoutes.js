const express = require('express')
const router = express.Router()
const ServiceController = require('../controllers/ServiceController')

router.get('/', ServiceController.render)
router.get('/detail', ServiceController.renderDetail)
router.post('/getCost', ServiceController.getCost)
router.post('/submitForService', ServiceController.submitForService)
router.post('/sendEmailToFriend', ServiceController.sendEmailToFriend)

module.exports = router