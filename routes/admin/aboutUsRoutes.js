const express = require('express')
const router = express.Router()

const AboutUsController = require('../../controllers/admin/AboutUsController')

router.get('/', AboutUsController.render)
router.get('/measureByCateId', AboutUsController.measureByCateId)

router.post('/updateAboutClinic', AboutUsController.updateAboutClinic)
router.post('/updateMetricsDesc', AboutUsController.updateMetricsDesc)

// quality categories
router.get('/readQualityCategories', AboutUsController.readQualityCategories)
router.post('/createQualityCategory', AboutUsController.createQualityCategory)
router.post('/chooseQualityCategory', AboutUsController.chooseQualityCategory)
router.post('/updateQualityCategory', AboutUsController.updateQualityCategory)
router.post('/deleteQualityCategory', AboutUsController.deleteQualityCategory)

// measures
router.post('/readMeasures', AboutUsController.readMeasures)
router.post('/createMeasure', AboutUsController.createMeasure)
router.post('/chooseMeasure', AboutUsController.chooseMeasure)
router.post('/updateMeasure', AboutUsController.updateMeasure)
router.post('/deleteMeasure', AboutUsController.deleteMeasure)

module.exports = router