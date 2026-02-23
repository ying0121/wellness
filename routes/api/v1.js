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
 * }
 * 
 */
router.post('/auth', V1Controller.auth)

/**
 * Get Patient API
 * @param {string} patient_id - The ID of the patient
 * @param {string} name - The name of the patient
 * @param {string} email - The email of the patient
 * @param {string} phone - The phone of the patient
 * @param {string} dob - The date of birth of the patient
 * @returns {object} - The response object
 * @example
 * {
 *   "status": "success",
 *   "data": {
 *     "pt_emr_id": 1,
 *     "clinic_id": 1,
 *     "name": "John Doe",
 *     "email": "john.doe@example.com",
 *     "cel": "1234567890",
 *     "dob": "1990-01-01",
 *     "lang": "en"
 *   }
 * }
 */
router.get('/patient', apiAuth, V1Controller.getPatient)

module.exports = router