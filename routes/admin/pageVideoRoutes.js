
const express = require('express')
const router = express.Router()

const PageVideoController = require('../../controllers/admin/PageVideoController')

router.get('/', PageVideoController.render)

router.get('/read', PageVideoController.read)
router.post('/create', PageVideoController.create)
router.post('/update', PageVideoController.update)
router.post('/choose', PageVideoController.choose)
router.post('/delete', PageVideoController.delete)

module.exports = router