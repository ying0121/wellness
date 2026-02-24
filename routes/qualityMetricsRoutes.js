const express = require('express')
const router = express.Router()
const QualityMetricsController = require('../controllers/QualityMetricsController')

router.get('/', QualityMetricsController.render)

module.exports = router