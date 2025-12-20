const express = require('express')
const router = express.Router()
const LetterController = require('../controllers/LetterController')

router.get('/', LetterController.render)
router.get('/detail', LetterController.renderDetail)
router.post('/getCost', LetterController.getCost)
router.post('/submitForLetter', LetterController.submitForLetter)

module.exports = router