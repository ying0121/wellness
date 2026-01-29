const express = require('express')
const router = express.Router()
const NewsletterController = require('../controllers/NewsletterController')

router.get('/:id', NewsletterController.renderDetail)

module.exports = router
