
const express = require('express')
const router = express.Router()
const SurveyController = require('../../controllers/admin/SurveyController')

router.get('/', SurveyController.render)
router.get('/view-result', SurveyController.renderViewResult)
router.get('/questions', SurveyController.renderQuestion)

router.post('/getSurveys', SurveyController.getSurveys)
router.post('/addSurvey', SurveyController.addSurvey)
router.post('/chosenSurvey', SurveyController.chosenSurvey)
router.post('/editSurvey', SurveyController.editSurvey)
router.post('/deleteSurvey', SurveyController.deleteSurvey)

router.post('/sendEmail', SurveyController.sendEmail)
router.post('/sendSMS', SurveyController.sendSMS)

router.post('/chosenResponse', SurveyController.chosenResponse)

router.post('/generateSurvey', SurveyController.generateSurvey)

router.get('/submit', SurveyController.submit)

router.post('/deleteData', SurveyController.deleteData)

router.post('/sendResultEmail', SurveyController.sendResultEmail)

router.post('/result', SurveyController.result)

module.exports = router
