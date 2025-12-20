const express = require('express')
const router = express.Router()
const CommunityResourceController = require('../controllers/CommunityResourceController')

router.get('/', CommunityResourceController.render)

module.exports = router