const express = require('express')
const router = express.Router()
const OrientationController = require('../controllers/OrientationController')

router.get('/', OrientationController.render)

module.exports = router