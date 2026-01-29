const express = require('express')
const router = express.Router()
const FeesController = require('../controllers/FeesController')

router.get('/', FeesController.render)

module.exports = router
