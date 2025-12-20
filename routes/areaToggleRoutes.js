const express = require('express')
const router = express.Router()
const AreaToggleController = require('../controllers/AreaToggleController')

router.post('/choose', AreaToggleController.choose)
router.post('/update', AreaToggleController.update)

module.exports = router