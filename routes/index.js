
const express = require("express")
const router = express.Router()

// Admin page
const adminRoutes = require("./admin/")
router.use(process.env.PREFIX_URL, adminRoutes)

// middlewares
const auth = require("../middlewares/auth")

// sub routes
const homeRoutes = require("./homeRoutes")
const theClinicRoutes = require("./theClinicRoutes")
const aboutUsRoutes = require("./aboutUsRoutes")
const serviceRoutes = require("./serviceRoutes")
const letterRoutes = require("./letterRoutes")
const orientationRoutes = require("./orientationRoutes")
const communityResourceRoutes = require("./communityResourceRoutes")
const educationRoutes = require("./educationRoutes")
const insuranceRoutes = require("./insuranceRoutes")
const contactRoutes = require("./contactRoutes")
const vaultRoutes = require("./vaultRoutes")
const paymentRoutes = require("./paymentRoutes")
const areaToggleRoutes = require("./areaToggleRoutes")
const newsletterRoutes = require("./newsletterRoutes")
const feesRoutes = require("./feesRoutes")

// controllers
const AuthController = require("../controllers/AuthController")

// main routes
router.use("/", homeRoutes)
router.use("/the-clinic", theClinicRoutes)
router.use("/about-us", aboutUsRoutes)
router.use("/services", serviceRoutes)
router.use("/letters", letterRoutes)
router.use("/orientation", orientationRoutes)
router.use("/community-resources", communityResourceRoutes)
router.use("/educations", educationRoutes)
router.use("/insurances", insuranceRoutes)
router.use("/contact", contactRoutes)
router.use("/vault", auth, vaultRoutes)
router.use("/payment", paymentRoutes)
router.use("/area-toggle", areaToggleRoutes)
router.use("/newsletter", newsletterRoutes)
router.use("/fees", feesRoutes)

// patient auth routes
router.get("/login", AuthController.signin)
router.get("/signin", AuthController.signin)
router.get("/security", AuthController.security)
router.get("/signup", AuthController.signup)
router.get("/help", AuthController.help)
router.get("/logout", AuthController.signout)
router.get("/signout", AuthController.signout)

router.get("/:verify_url", AuthController.verify)

router.post("/confirmSignIn", AuthController.confirmSignIn)
router.post("/confirmSecurity", AuthController.confirmSecurity)
router.post("/confirmSignUp", AuthController.confirmSignUp)
router.post("/confirmHelp", AuthController.confirmHelp)
router.post("/confirmVerify", AuthController.confirmVerify)

module.exports = router
