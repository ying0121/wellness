const express = require('express')
const router = express.Router()
const PaymentController = require('../controllers/PaymentController')

router.post('/createPaymentIntent', PaymentController.createPaymentIntent)
router.post('/paymentResult', PaymentController.paymentResult)

module.exports = router