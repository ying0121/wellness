const express = require('express')
const router = express.Router()
const EducationController = require('../controllers/EducationController')

router.get('/', EducationController.render)

module.exports = router