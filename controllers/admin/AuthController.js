
const md5 = require("md5")

const Managers = require("../../models/Managers")
const UserSecurity = require("../../models/UserSecurity")
const SQuestion = require("../../models/SQuestion")
const Setting = require("../../models/Setting")

// sign in page
exports.signin = async (req, res, next) => {
    let data = {}

    data.site_url = process.env.SITE_URL
    data.prefix = process.env.PREFIX_URL
    data.contact_info = {
        name: "ADMIN LOGIN"
    }
    data.area_toggle = null

	res.render('admin/auth/signin', data)
}
// security page
exports.security = async (req, res, next) => {
    if (req.session.isAdminSecurity === true) {
        let data = {}

        data.site_url = process.env.SITE_URL
        data.prefix = process.env.PREFIX_URL
        data.contact_info = {
            name: "ADMIN SECURITY"
        }
        data.area_toggle = null
        data.question = req.session.adminQuestion

        res.render('admin/auth/security', data)
    } else {
        res.redirect(process.env.PREFIX_URL)
    }
}
// logout
exports.logout = async (req, res, next) => {
    req.session.adminQuestion = null
    req.session.isAdminSecurity = false
    req.session.adminUser = null
    req.session.isAdminLogin = false

    req.session.loginTime = null
    req.session.expiredTime = null

    res.redirect(process.env.PREFIX_URL)
}


exports.confirmSignIn = async (req, res, next) => {
    const email = req.body.email
    const password = req.body.password

    const accountInfo = await Managers.findOne({ where: { email: email, password: md5(password) } })
    if (accountInfo) { // correct account information
        // add to session account information
        req.session.adminUser = accountInfo
        const questions = await UserSecurity.findAll({ where: { user_id: accountInfo.id, user_type: "manager" } })
        if (questions.length) { // go to security page
            req.session.isAdminSecurity = true
            // get question
            const question = await SQuestion.findOne({ where: { id: questions[Math.floor(Math.random() * questions.length)].question_id } })
            req.session.adminQuestion = question

            return res.status(200).json({ status: "success", url: process.env.PREFIX_URL + "/security" })
        } else { // go to admin page directly
            req.session.isAdminSecurity = false
            req.session.isAdminLogin = true

            req.session.loginTime = new Date(Date.now())
            const expiredTime = await Setting.findOne({ where: { type: "session_timeout" } })
            req.session.expiredTime = expiredTime.value ? expiredTime.value : 30

            return res.status(200).json({ status: "success", url: process.env.PREFIX_URL + "/home" })
        }
    } else { // wrong
        return res.status(200).json({ status: "error", error: "failed" })
    }
}
exports.confirmSecurity = async (req, res, next) => {
    const answer = req.body.answer
    const question = req.session.adminQuestion
    const user = req.session.adminUser

    req.session.adminQuestion = null
    req.session.isAdminSecurity = false

    const auth = await UserSecurity.findOne({ where: { user_id: user.id, question_id: question.id, user_type: "manager" } })
    
    if (auth && auth.answer === md5(answer)) { // correct answer
        req.session.isAdminLogin = true

        req.session.loginTime = new Date(Date.now())
        const expiredTime = await Setting.findOne({ where: { type: "session_timeout" } })
        req.session.expiredTime = expiredTime.value ? expiredTime.value : 30

        return res.status(200).json({ status: "success", url: process.env.PREFIX_URL + "/home" })
    } else { // wrong answer
        req.session.adminUser = null

        return res.status(200).json({ status: "success", url: process.env.PREFIX_URL })
    }
}
