const express = require('express')
const router = express.Router()
const HomeController = require('../controllers/HomeController')

router.get('/', HomeController.render)
router.get('/gf', HomeController.getFile)
router.post('/changeLanguage', HomeController.changeLanguage)
router.post('/changeCaptchaImage', HomeController.changeCaptchaImage)
router.post('/submit', HomeController.submit)
router.post('/submitSignUpForFooter', HomeController.submitSignUpForFooter)

router.get('/terms-of-use', HomeController.renderTermsOfUse)
router.get('/privacy-policy', HomeController.renderPrivacyPolicy)

module.exports = router