const express = require('express')
const router = express.Router()

const ManagerController = require('../../controllers/admin/ManagerController')

router.get('/', ManagerController.render)

router.get('/read', ManagerController.read)
router.post('/create', ManagerController.create)
router.post('/update', ManagerController.update)
router.post('/choose', ManagerController.choose)
router.post('/delete', ManagerController.delete)

router.post('/reset-pwd', ManagerController.resetPassword)
router.post('/updateAccessRights', ManagerController.updateAccessRights)
router.post('/setSecurity', ManagerController.setSecurity)
router.post('/readOnlyActive', ManagerController.readOnlyActive)
router.post('/addUserSecurity', ManagerController.addUserSecurity)

module.exports = router