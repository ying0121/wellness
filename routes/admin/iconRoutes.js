const express = require('express')
const router = express.Router()

const IconController = require('../../controllers/admin/IconController')

router.post('/read', IconController.read)
router.post('/create', IconController.create)
router.post('/update', IconController.update)
router.post('/delete', IconController.delete)

module.exports = router