
const express = require("express")
const router = express.Router()

// middleware
const adminAuthMiddleware = require("../../middlewares/admin-auth")

const homeRoutes = require("./homeRoutes")
const theClinicRoutes = require("./theClinicRoutes")
const aboutUsRoutes = require("./aboutUsRoutes")
const insuranceRoutes = require("./insuranceRoutes")
const orientationRoutes = require("./orientationRoutes")
const serviceRoutes = require("./serviceRoutes")
const feeRoutes = require("./feeRoutes")
const letterRoutes = require("./letterRoutes")
const contactRoutes = require("./contactRoutes")
const educationRoutes = require("./educationRoutes")
const doctorRoutes = require("./doctorRoutes")
const staffRoutes = require("./staffRoutes")
const patientReviewRoutes = require("./patientReviewRoutes")
const pageImageRoutes = require("./pageImageRoutes")
const pageVideoRoutes = require("./pageVideoRoutes")
const patientAreaRoutes = require("./patientAreaRoutes")
const settingRoutes = require("./settingRoutes")
const managerRoutes = require("./managerRoutes")
const alertRoutes = require("./alertRoutes")
const surveyRoutes = require("./surveyRoutes")
const newsletterRoutes = require("./newsletterRoutes")

const languageRoutes = require("./languageRoutes")
const iconRoutes = require("./iconRoutes")
const vaultRoutes = require("./vaultRoutes")
const patientRoutes = require("./patientRoutes")

const emailRoutes = require("./emailRoutes")

// auth controller
const AuthController = require("../../controllers/admin/AuthController")

// auth routes
router.get("/", AuthController.signin)
router.get("/login", AuthController.signin)
router.get("/signin", AuthController.signin)
router.get("/security", AuthController.security)
router.get("/logout", AuthController.logout)

router.post("/confirmSignIn", AuthController.confirmSignIn)
router.post("/confirmSecurity", AuthController.confirmSecurity)

// admin routes
router.use("/home", adminAuthMiddleware, homeRoutes)
router.use("/the-clinic", adminAuthMiddleware, theClinicRoutes)
router.use("/about-us", adminAuthMiddleware, aboutUsRoutes)
router.use("/insurances", adminAuthMiddleware, insuranceRoutes)
router.use("/orientations", adminAuthMiddleware, orientationRoutes)
router.use("/services", adminAuthMiddleware, serviceRoutes)
router.use("/fees", adminAuthMiddleware, feeRoutes)
router.use("/letters", adminAuthMiddleware, letterRoutes)
router.use("/contacts", adminAuthMiddleware, contactRoutes)
router.use("/educations", adminAuthMiddleware, educationRoutes)
router.use("/doctors", adminAuthMiddleware, doctorRoutes)
router.use("/staffs", adminAuthMiddleware, staffRoutes)
router.use("/patient-reviews", adminAuthMiddleware, patientReviewRoutes)
router.use("/page-images", adminAuthMiddleware, pageImageRoutes)
router.use("/page-videos", adminAuthMiddleware, pageVideoRoutes)
router.use("/patient-areas", adminAuthMiddleware, patientAreaRoutes)
router.use("/settings", adminAuthMiddleware, settingRoutes)
router.use("/managers", adminAuthMiddleware, managerRoutes)
router.use("/alerts", adminAuthMiddleware, alertRoutes)
router.use("/surveys", adminAuthMiddleware, surveyRoutes)
router.use("/newsletter", adminAuthMiddleware, newsletterRoutes)

router.use("/languages", adminAuthMiddleware, languageRoutes)
router.use("/icons", adminAuthMiddleware, iconRoutes)
router.use("/vaults", adminAuthMiddleware, vaultRoutes)
router.use("/patients", adminAuthMiddleware, patientRoutes)
router.use("/email", adminAuthMiddleware, emailRoutes)

module.exports = router
