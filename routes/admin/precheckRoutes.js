
const express = require('express')
const router = express.Router()

const PrecheckController = require('../../controllers/admin/PrecheckController')

router.get('/', PrecheckController.render)

module.exports = router
