const express = require('express')
const router = express.Router()

const apiAuth = require('../../middlewares/api-auth')

const V1Controller = require('../../controllers/api/V1Controller')

/**
 * Test API
 * @returns {object} - The response object
 * @example
 * {
 *   "status": "success",
 *   "message": "Hello World!"
 * }
 */
router.get('/', V1Controller.helloWorld)

/**
 * Authentication API
 * @param {string} email - The email of the user
 * @param {string} password - The password of the user
 * @returns {object} - The response object
 * @example
 * {
 *   "status": "success",
 *   "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJhZG1pbkBleGFtcGxlLmNvbSIsImZuYW1lIjoiQWRtaW4iLCJsbmFtZSI6IkFkbWluIiwiaWF0IjoxNjg5MjM5MDIyfQ.4444444444444444444444444444444444444444"
 * }yes
 * 
 */
router.post('/auth', V1Controller.auth)

/**
 * Get Patient API
 * @param {string} patient_id - The ID of the patient
 * @param {string} fname - The first name of the patient
 * @param {string} lname - The last name of the patient
 * @param {string} email - The email of the patient
 * @param {string} phone - The phone of the patient
 * @param {string} dob - The date of birth of the patient
 * @returns {object} - The response object
 * @example
 * {
 *   "status": "success",
 *   "data": {
 *     "patient_id": 1,
 *     "fname": "John",
 *     "lname": "Doe",
 *     "email": "john.doe@example.com",
 *     "phone": "1234567890",
 *     "dob": "1990-01-01"
 *   }
 * }
 */
router.get('/patient', apiAuth, V1Controller.getPatient)

module.exports = router