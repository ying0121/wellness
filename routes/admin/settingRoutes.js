
const fs = require('fs')
const path = require('path')
const multer = require('multer')
const express = require('express')
const router = express.Router()

const SettingController = require('../../controllers/admin/SettingController')

// multers
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, "../../public/assets/images")

        // create folder if it doesn't exist
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true })
        }

        cb(null, uploadPath)
    },
    filename: (req, file, cb) => {
        const filename = req.headers["x-file-name"]
        cb(null, filename)
    },
})
const uploadImage = multer({ storage, limits: { fileSize: 10240000 }, }).fields([ { name: "img", maxCount: 1 }])

router.get('/', SettingController.render)

// home
router.post('/updateHomeText', SettingController.updateHomeText)

// communication
// 1. conact emails
router.post('/contact-email/read', SettingController.readContactEmails)
router.post('/contact-email/add', SettingController.addContactEmails)
router.post('/contact-email/update', SettingController.updateContactEmails)
router.post('/contact-email/choose', SettingController.chooseContactEmails)
router.post('/contact-email/delete', SettingController.deleteContactEmails)
// 2. contact reason
router.post('/contact-reason/read', SettingController.readContactReason)
router.post('/contact-reason/add', SettingController.addContactReason)
router.post('/contact-reason/update', SettingController.updateContactReason)
router.post('/contact-reason/choose', SettingController.chooseContactReason)
router.post('/contact-reason/delete', SettingController.deleteContactReason)
// 3. opt in & out
router.post('/opt/read', SettingController.readOptInOutText)
router.post('/opt/update', SettingController.updateOptInOutText)
// 4. send to friend
router.post('/sf/read', SettingController.readSendToFriendText)
router.post('/sf/update', SettingController.updateSendToFriendText)

// translations
router.post('/translations/read', SettingController.readTranslations)
router.post('/translations/add', SettingController.addTranslations)
router.post('/translations/choose', SettingController.chooseTranslation)
router.post('/translations/update', SettingController.updateTranslation)
router.post('/translations/delete', SettingController.deleteTranslation)

// meta languages
router.post('/meta/updateMeta', SettingController.updateMeta)
router.post('/meta/updateFacebook', SettingController.updateFacebook)
router.post('/meta/updateTwitter', SettingController.updateTwitter)
router.post('/meta/uploadImage', async (req, res) => {
    uploadImage(req, res, async (err) => {
        if (err) return res.status(400).json({ error: err.message })

        try {
            return res.status(200).json({ status: "success" })
        } catch (error) {
            res.status(500).json({ status: "error", message: "Server error" })
        }
    })
})

// conector apis
router.post('/api/read', SettingController.readAPI)
router.post('/api/add', SettingController.addAPI)
router.post('/api/update', SettingController.updateAPI)
router.post('/api/delete', SettingController.deleteAPI)

// securities
router.post('/securities/read', SettingController.readSecurities)
router.post('/securities/add', SettingController.addSecurity)
router.post('/securities/update', SettingController.updateSecurity)
router.post('/securities/choose', SettingController.chooseSecurity)
router.post('/securities/delete', SettingController.deleteSecurity)

// system information
router.post('/updateSysInfo', SettingController.updateSysInfo)

// payments
router.post('/payments/read', SettingController.readPayment)
router.post('/payments/add', SettingController.addPayment)
router.post('/payments/update', SettingController.updatePayment)
router.post('/payments/choose', SettingController.choosePayment)
router.post('/payments/delete', SettingController.deletePayment)

// patient areas
// 1. sign in
router.post('/patient-areas/readSignInContent', SettingController.readSignInContent)
router.post('/patient-areas/updateSignInContent', SettingController.updateSignInContent)
// 2. sign up
router.post('/patient-areas/readSignUpContent', SettingController.readSignUpContent)
router.post('/patient-areas/updateSignUpContent', SettingController.readSignUpContent)
// 3. login failed
router.post('/patient-areas/readLoginFailedContent', SettingController.readLoginFailedContent)
router.post('/patient-areas/updateLoginFailedContent', SettingController.updateLoginFailedContent)
// 4. pt area rules
router.post('/patient-areas/updateSettingValue', SettingController.updateSettingValue)
// 5. prompts
router.post('/patient-areas/readPromptsContent', SettingController.readPromptsContent)
router.post('/patient-areas/updatePromptsContent', SettingController.updatePromptsContent)
// 6. email accounts
router.post('/patient-areas/readEmailAccountContent', SettingController.readEmailAccountContent)
router.post('/patient-areas/updateEmailAccountContent', SettingController.updateEmailAccountContent)
// 7. email password
router.post('/patient-areas/readEmailPasswordContent', SettingController.readEmailPasswordContent)
router.post('/patient-areas/updateEmailPasswordContent', SettingController.updateEmailPasswordContent)
// 8. email update
router.post('/patient-areas/readEmailUpdateContent', SettingController.readEmailUpdateContent)
router.post('/patient-areas/updateEmailUpdateContent', SettingController.updateEmailUpdateContent)
// 9. email closed
router.post('/patient-areas/readEmailCloseContent', SettingController.readEmailCloseContent)
router.post('/patient-areas/updateEmailCloseContent', SettingController.updateEmailCloseContent)
// 10. access help
router.post('/patient-areas/readNeedHelpContent', SettingController.readNeedHelpContent)
router.post('/patient-areas/updateNeedHelpContent', SettingController.updateNeedHelpContent)
// 11. vault
router.post('/patient-areas/readVaultContent', SettingController.readVaultContent)
router.post('/patient-areas/updateVaultContent', SettingController.updateVaultContent)

module.exports = router
