const express = require('express')
const router = express.Router()
const HomeController = require('../../controllers/admin/HomeController')

router.get('/', HomeController.render)

router.post('/updateHomeHeaderText', HomeController.updateHomeHeaderText)

module.exports = router