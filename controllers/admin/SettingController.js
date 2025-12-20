
const AreaToggle = require("../../models/AreaToggle")
const Translation = require("../../models/Translation")
const Meta = require("../../models/Meta")
const ContactEmail = require("../../models/ContactEmail")
const ContactReason = require("../../models/ContactReason")
const API = require("../../models/API")
const Setting = require("../../models/Setting")
const SystemInfo = require("../../models/SystemInfo")
const PaymentStripe = require("../../models/PaymentStripe")
const ContactInfo = require("../../models/ContactInfo")
const SQuestion = require("../../models/SQuestion")

const { Op } = require("sequelize")

exports.render = async (req, res, next) => {
	let data = {}

	data.sideItem = "settings"
	data.site_url = process.env.SITE_URL
	data.prefix = process.env.PREFIX_URL
	data.menus = req.session.adminUser.access_rights
	data.userType = req.session.adminUser.type
	data.loginTime = req.session.loginTime
	data.expiredTime = req.session.expiredTime
	data.userFullName = req.session.adminUser.fname + " " + req.session.adminUser.lname

	const _a = await AreaToggle.findAll()
	data.area_toggle = {}
	_a.forEach(item => { data.area_toggle[item.area_id] = item.status })

	const _t = await Translation.findAll()
	data.component= []
	_t.forEach(item => { data.component[item.keyvalue] = [], data.component[item.keyvalue].en = item.en, data.component[item.keyvalue].es = item.es })

    data.contact_info = await ContactInfo.findOne({ where: { id: 1 } })

    data.meta = await Meta.findOne({ where: { id: 1 } })

    data.api = await API.findAll()

    data.logout_rules = await Setting.findAll()

    const sysinfo = await SystemInfo.findAll()
    data.sysinfo = { month: sysinfo[0].value, year: sysinfo[1].value, word: sysinfo[2].value, type: sysinfo[3].value, language: sysinfo[4].value }

    data.stripes = await PaymentStripe.findAll()

	res.render('admin/settings/index', data)
}

// home
exports.updateHomeText = async (req, res, next) => {
	const text_en = req.body.text_en
	const text_es = req.body.text_es

	await Translation.update({ en: text_en, es: text_es }, { where: { keyvalue: "t_home_header" } })

	return res.status(200).json({ status: "success" })
}

// communication
// 1. contact emails
exports.readContactEmails = async (req, res, next) => {
    const contactEmails = await ContactEmail.findAll()

    res.status(200).json({ data: contactEmails })
}
exports.addContactEmails = async (req, res, next) => {
    const contact_name = req.body.contact_name
    const email = req.body.email
    const account_request = req.body.account_request
    const general_online = req.body.general_online
    const specific_online = req.body.specific_online
    const payment_email = req.body.payment_email

    // check if is already existed
    const one = await ContactEmail.findOne({ where: { email } })
    if (one) {
        return res.status(200).json({ status: "existed" })
    }

    await ContactEmail.create({ contact_name, email, account_request, general_online, specific_online, payment_email })

    return res.status(200).json({ status: "success" })
}
exports.updateContactEmails = async (req, res, next) => {
    const id = req.body.id
    const contact_name = req.body.contact_name
    const email = req.body.email
    const account_request = req.body.account_request
    const general_online = req.body.general_online
    const specific_online = req.body.specific_online
    const payment_email = req.body.payment_email

    // check if is already existed
    const one = await ContactEmail.findOne({ where: { email: email, id: { [Op.ne]: id } } })
    if (one) {
        return res.status(200).json({ status: "existed" })
    }

    await ContactEmail.update({ contact_name, email, account_request, general_online, specific_online, payment_email }, { where: { id: id } })

    return res.status(200).json({ status: "success" })
}
exports.chooseContactEmails = async (req, res, next) => {
    const id = req.body.id

    const contactEmail = await ContactEmail.findOne({ where: { id: id } })

    res.status(200).json(contactEmail)
}
exports.deleteContactEmails = async (req, res, next) => {
    const id = req.body.id

    await ContactEmail.destroy({ where: { id: id } })

    res.status(200).json({ status: "success" })
}
// 2. contact reasons
exports.readContactReason = async (req, res, next) => {
    const contactReasons = await ContactReason.findAll()

    res.status(200).json({ data: contactReasons })
}
exports.addContactReason = async (req, res, next) => {
    const en_name = req.body.en_name
    const sp_name = req.body.sp_name

    await ContactReason.create({ en_name, sp_name })

    return res.status(200).json({ status: "success" })
}
exports.updateContactReason = async (req, res, next) => {
    const id = req.body.id
    const en_name = req.body.en_name
    const sp_name = req.body.sp_name

    await ContactReason.update({ en_name, sp_name }, { where: { id: id } })

    return res.status(200).json({ status: "success" })
}
exports.chooseContactReason = async (req, res, next) => {
    const id = req.body.id

    const contactReason = await ContactReason.findOne({ where: { id: id } })

    res.status(200).json(contactReason)
}
exports.deleteContactReason = async (req, res, next) => {
    const id = req.body.id

    await ContactReason.destroy({ where: { id: id } })

    res.status(200).json({ status: "success" })
}
// 3. opt in & out
exports.readOptInOutText = async (req, res, next) => {
    const _t = await Translation.findAll({ where: { keyvalue: { [Op.like]: "t_opt_in_out_%" } } })
	let component = {}
	_t.forEach(item => { component[item.keyvalue] = {}, component[item.keyvalue].en = item.en, component[item.keyvalue].es = item.es })

    res.status(200).json(component)
}
exports.updateOptInOutText = async (req, res, next) => {
    const opt_header_en = req.body.opt_header_en
    const opt_header_es = req.body.opt_header_es
    const opt_in_en = req.body.opt_in_en
    const opt_in_es = req.body.opt_in_es
    const opt_out_en = req.body.opt_out_en
    const opt_out_es = req.body.opt_out_es
    const opt_footer_en = req.body.opt_footer_en
    const opt_footer_es = req.body.opt_footer_es
    const opt_more_en = req.body.opt_more_en
    const opt_more_es = req.body.opt_more_es

    await Translation.update({ en: opt_header_en, es: opt_header_es }, { where: { keyvalue: "t_opt_in_out_header" } })
    await Translation.update({ en: opt_in_en, es: opt_in_es }, { where: { keyvalue: "t_opt_in_out_in" } })
    await Translation.update({ en: opt_out_en, es: opt_out_es }, { where: { keyvalue: "t_opt_in_out_out" } })
    await Translation.update({ en: opt_footer_en, es: opt_footer_es }, { where: { keyvalue: "t_opt_in_out_footer" } })
    await Translation.update({ en: opt_more_en, es: opt_more_es }, { where: { keyvalue: "t_opt_in_out_more" } })

    res.status(200).json({ status: "success" })
}
// 4. send to friend
exports.readSendToFriendText = async (req, res, next) => {
    const _t = await Translation.findAll({ where: { keyvalue: { [Op.like]: "t_sf_%" } } })
	let component = {}
	_t.forEach(item => { component[item.keyvalue] = {}, component[item.keyvalue].en = item.en, component[item.keyvalue].es = item.es })

    res.status(200).json(component)
}
exports.updateSendToFriendText = async (req, res, next) => {
    const sf_subject_en = req.body.sf_subject_en
    const sf_subject_es = req.body.sf_subject_es
    const sf_updated_text_en = req.body.sf_updated_text_en
    const sf_updated_text_es = req.body.sf_updated_text_es

    await Translation.update({ en: sf_subject_en, es: sf_subject_es }, { where: { keyvalue: "t_sf_subject" } })
    await Translation.update({ en: sf_updated_text_en, es: sf_updated_text_es }, { where: { keyvalue: "t_sf_updated_text" } })

    res.status(200).json({ status: "success" })
}

// translations
exports.readTranslations = async (req, res, next) => {
    const translations = await Translation.findAll({ where: { type: { [Op.ne]: "template" } } })

    res.status(200).json({ data: translations })
}
exports.addTranslations = async (req, res, next) => {
    const params = {
        type: "component",
        keyvalue: req.body.keyvalue,
        en: req.body.en,
        es: req.body.es
    }
    console.log(params)

    await Translation.create(params)

    res.status(200).json({ status: "success" })
}
exports.chooseTranslation = async (req, res, next) => {
    const id = req.body.id
    const translation = await Translation.findOne({ where: { id: id } })

    res.status(200).json(translation)
}
exports.updateTranslation = async (req, res, next) => {
    const keyvalue = req.body.keyvalue
    const en = req.body.en
    const es = req.body.es

    await Translation.update({ en, es }, { where: { keyvalue } })

    res.status(200).json({ status: "success" })
}
exports.deleteTranslation = async (req, res, next) => {
    const id = req.body.id

    await Translation.destroy({ where: { id: id } })

    res.status(200).json({ status: "success" })
}

// meta language
exports.updateMeta = async (req, res, next) => {
    const meta_title = req.body.meta_title
    const meta_desc = req.body.meta_desc

    await Meta.update({ meta_title, meta_desc }, { where: { id: 1 } })

    res.status(200).json({ status: "success" })
}
exports.updateFacebook = async (req, res, next) => {
    const facebook_title = req.body.facebook_title
    const facebook_desc = req.body.facebook_desc

    await Meta.update({ facebook_title, facebook_desc }, { where: { id: 1 } })

    res.status(200).json({ status: "success" })
}
exports.updateTwitter = async (req, res, next) => {
    const twitter_title = req.body.twitter_title
    const twitter_desc = req.body.twitter_desc

    await Meta.update({ twitter_title, twitter_desc }, { where: { id: 1 } })

    res.status(200).json({ status: "success" })
}

// conector api
exports.readAPI = async (req, res, next) => {
    const apis = await API.findAll()

    res.status(200).json({ data: apis })
}
exports.addAPI = async (req, res, next) => {
    const url = req.body.url

    await API.create({ url })

    res.status(200).json({ status: "success" })
}
exports.updateAPI = async (req, res, next) => {
    const id = req.body.id
    const url = req.body.url

    await API.update({ url }, { where: { id } })

    res.status(200).json({ status: "success" })
}
exports.deleteAPI = async (req, res, next) => {
    const id = req.body.id

    await API.destroy({ where: { id: id } })

    res.status(200).json({ status: "success" })
}

// securities
exports.readSecurities = async (req, res, next) => {
    const securities = await SQuestion.findAll()

    res.status(200).json({ data: securities })
}
exports.addSecurity = async (req, res, next) => {
    const en = req.body.en
    const es = req.body.es
    const status = req.body.status

    await SQuestion.create({ en, es, status })

    res.status(200).json({ status: "success" })
}
exports.updateSecurity = async (req, res, next) => {
    const id = req.body.id
    const en = req.body.en
    const es = req.body.es
    const status = req.body.status

    await SQuestion.update({ en, es, status }, { where: { id: id } })

    res.status(200).json({ status: "success" })
}
exports.chooseSecurity = async (req, res, next) => {
    const id = req.body.id

    const security = await SQuestion.findOne({ where: { id: id } })

    res.status(200).json(security)
}
exports.deleteSecurity = async (req, res, next) => {
    const id = req.body.id

    await SQuestion.destroy({ where: { id: id } })

    res.status(200).json({ status: "success" })
}

// system information
exports.updateSysInfo = async (req, res, next) => {
    const month = req.body.month
    const year = req.body.year
    const word = req.body.word
    const type = req.body.type
    const language = req.body.language

    await SystemInfo.update({ value: month }, { where: { info_name: "month" } })
    await SystemInfo.update({ value: year }, { where: { info_name: "year" } })
    await SystemInfo.update({ value: word }, { where: { info_name: "word" } })
    await SystemInfo.update({ value: type }, { where: { info_name: "type" } })
    await SystemInfo.update({ value: language }, { where: { info_name: "language" } })

    res.status(200).json({ status: "success" })
}

// payment for stripe
exports.readPayment = async (req, res, next) => {
    const paymentStripes = await PaymentStripe.findAll()

    res.status(200).json(paymentStripes)
}
exports.addPayment = async (req, res, next) => {
    const stripe = req.body.stripe

    await PaymentStripe.create({ stripe })

    res.status(200).json({ status: "success" })
}
exports.updatePayment = async (req, res, next) => {
    const id = req.body.id
    const stripe = req.body.stripe

    await PaymentStripe.update({ stripe }, { where: { id: id } })

    res.status(200).json({ status: "success" })
}
exports.choosePayment = async (req, res, next) => {
    const id = req.body.id

    const paymentStripe = await PaymentStripe.findOne({ where: { id: id } })

    res.status(200).json(paymentStripe)
}
exports.deletePayment = async (req, res, next) => {
    const id = req.body.id

    await PaymentStripe.destroy({ where: { id: id } })

    res.status(200).json({ status: "success" })
}

// patient areas
// 1. sign in
exports.readSignInContent = async (req, res, next) => {
    let _t = await Translation.findAll({ where: { type: "template", keyvalue: { [Op.like]: "t_pa_si_%" } } })

    let translations = { en: {}, es: {} }
    _t.forEach(row => {
        translations.en[row.keyvalue] = row.en
        translations.es[row.keyvalue] = row.es
    })

    res.status(200).json(translations)
}
exports.updateSignInContent = async (req, res, next) => {
    const pa_si_welcome_en = req.body.pa_si_welcome_en
    const pa_si_welcome_sp = req.body.pa_si_welcome_sp
    const pa_si_signin_en = req.body.pa_si_signin_en
    const pa_si_signin_sp = req.body.pa_si_signin_sp
    const pa_si_formtext_en = req.body.pa_si_formtext_en
    const pa_si_formtext_sp = req.body.pa_si_formtext_sp

    await Translation.update({ en: pa_si_welcome_en, es: pa_si_welcome_sp }, { where: { keyvalue: "t_pa_si_welcome" } })
    await Translation.update({ en: pa_si_signin_en, es: pa_si_signin_sp }, { where: { keyvalue: "t_pa_si_signin" } })
    await Translation.update({ en: pa_si_formtext_en, es: pa_si_formtext_sp }, { where: { keyvalue: "t_pa_si_formtext" } })

    res.status(200).json({ status: "success" })
}
// 2. sign up
exports.readSignUpContent = async (req, res, next) => {
    let _t = await Translation.findAll({ where: { type: "template", keyvalue: { [Op.like]: "t_pa_su_%" } } })

    let translations = { en: {}, es: {} }
    _t.forEach(row => {
        translations.en[row.keyvalue] = row.en
        translations.es[row.keyvalue] = row.es
    })

    res.status(200).json(translations)
}
exports.updateSignUpContent = async (req, res, next) => {
    const pa_su_account_en = req.body.pa_su_account_en
    const pa_su_account_sp = req.body.pa_su_account_sp
    const pa_su_signup_en = req.body.pa_su_signup_en
    const pa_su_signup_sp = req.body.pa_su_signup_sp
    const pa_su_send_en = req.body.pa_su_send_en
    const pa_su_send_sp = req.body.pa_su_send_sp
    const pa_su_eheader_en = req.body.pa_su_eheader_en
    const pa_su_eheader_sp = req.body.pa_su_eheader_sp
    const pa_su_alert_success_en = req.body.pa_su_alert_success_en
    const pa_su_alert_success_sp = req.body.pa_su_alert_success_sp
    const pa_su_alert_failed_en = req.body.pa_su_alert_failed_en
    const pa_su_alert_failed_sp = req.body.pa_su_alert_failed_sp
    const pa_su_alert_exist_en = req.body.pa_su_alert_exist_en
    const pa_su_alert_exist_sp = req.body.pa_su_alert_exist_sp

    await Translation.update({ en: pa_su_account_en, es: pa_su_account_sp }, { where: { keyvalue: "t_pa_su_account" } })
    await Translation.update({ en: pa_su_signup_en, es: pa_su_signup_sp }, { where: { keyvalue: "t_pa_su_signup" } })
    await Translation.update({ en: pa_su_send_en, es: pa_su_send_sp }, { where: { keyvalue: "t_pa_su_send" } })
    await Translation.update({ en: pa_su_eheader_en, es: pa_su_eheader_sp }, { where: { keyvalue: "t_pa_su_eheader" } })
    await Translation.update({ en: pa_su_alert_success_en, es: pa_su_alert_success_sp }, { where: { keyvalue: "t_pa_su_alert_success" } })
    await Translation.update({ en: pa_su_alert_failed_en, es: pa_su_alert_failed_sp }, { where: { keyvalue: "t_pa_su_alert_failed" } })
    await Translation.update({ en: pa_su_alert_exist_en, es: pa_su_alert_exist_sp }, { where: { keyvalue: "t_pa_su_alert_exist" } })

    res.status(200).json({ status: "success" })
}
// 3. login failed
exports.readLoginFailedContent = async (req, res, next) => {
    let _t = await Translation.findAll({ where: { type: "template", keyvalue: { [Op.like]: "t_pa_lf_%" } } })

    let translations = { en: {}, es: {} }
    _t.forEach(row => {
        translations.en[row.keyvalue] = row.en
        translations.es[row.keyvalue] = row.es
    })

    res.status(200).json(translations)
}
exports.updateLoginFailedContent = async (req, res, next) => {
    const pa_lf_invalid_en = req.body.pa_lf_invalid_en
    const pa_lf_invalid_sp = req.body.pa_lf_invalid_sp
    const pa_lf_text_en = req.body.pa_lf_text_en
    const pa_lf_text_sp = req.body.pa_lf_text_sp
    const pa_lf_failed_en = req.body.pa_lf_failed_en
    const pa_lf_failed_sp = req.body.pa_lf_failed_sp
    const pa_lf_inactive_en = req.body.pa_lf_inactive_en
    const pa_lf_inactive_sp = req.body.pa_lf_failed_sp

    await Translation.update({ en: pa_lf_invalid_en, es: pa_lf_invalid_sp }, { where: { keyvalue: "t_pa_lf_invalid" } })
    await Translation.update({ en: pa_lf_text_en, es: pa_lf_text_sp }, { where: { keyvalue: "t_pa_lf_text" } })
    await Translation.update({ en: pa_lf_failed_en, es: pa_lf_failed_sp }, { where: { keyvalue: "t_pa_lf_failed" } })
    await Translation.update({ en: pa_lf_inactive_en, es: pa_lf_inactive_sp }, { where: { keyvalue: "t_pa_lf_inactive" } })

    res.status(200).json({ status: "success" })
}
// 4. pt area rules
exports.updateSettingValue = async (req, res, next) => {
    const value = req.body.value
    const type = req.body.type

    await Setting.update({ value }, { where: { type } })

    res.status(200).json({ status: "success" })
}
// 5. prompts
exports.readPromptsContent = async (req, res, next) => {
    let _t = await Translation.findAll({ where: { type: "template", keyvalue: { [Op.like]: "t_pa_pr_%" } } })

    let translations = { en: {}, es: {} }
    _t.forEach(row => {
        translations.en[row.keyvalue] = row.en
        translations.es[row.keyvalue] = row.es
    })

    res.status(200).json(translations)
}
exports.updatePromptsContent = async (req, res, next) => {
    const pa_pr_footer_en = req.body.pa_pr_footer_en
    const pa_pr_footer_sp = req.body.pa_pr_footer_sp
    const pa_pr_security_en = req.body.pa_pr_security_en
    const pa_pr_security_sp = req.body.pa_pr_security_sp
    const pa_pr_sihelp_en = req.body.pa_pr_sihelp_en
    const pa_pr_sihelp_sp = req.body.pa_pr_sihelp_sp

    await Translation.update({ en: pa_pr_footer_en, es: pa_pr_footer_sp }, { where: { keyvalue: "t_pa_pr_footer" } })
    await Translation.update({ en: pa_pr_security_en, es: pa_pr_security_sp }, { where: { keyvalue: "t_pa_pr_security" } })
    await Translation.update({ en: pa_pr_sihelp_en, es: pa_pr_sihelp_sp }, { where: { keyvalue: "t_pa_pr_sihelp" } })

    res.status(200).json({ status: "success" })
}
// 6. email accounts
exports.readEmailAccountContent = async (req, res, next) => {
    let _t = await Translation.findAll({ where: { type: "template", keyvalue: { [Op.like]: "t_pa_ea_%" } } })

    let translations = { en: {}, es: {} }
    _t.forEach(row => {
        translations.en[row.keyvalue] = row.en
        translations.es[row.keyvalue] = row.es
    })

    res.status(200).json(translations)
}
exports.updateEmailAccountContent = async (req, res, next) => {
    const pa_ea_email_text_en = req.body.pa_ea_email_text_en
    const pa_ea_email_text_sp = req.body.pa_ea_email_text_sp
    const pa_ea_link_en = req.body.pa_ea_link_en
    const pa_ea_link_sp = req.body.pa_ea_link_sp
    const pa_ea_subject_en = req.body.pa_ea_subject_en
    const pa_ea_subject_sp = req.body.pa_ea_subject_sp
    const pa_ea_disclaimer_en = req.body.pa_ea_disclaimer_en
    const pa_ea_disclaimer_sp = req.body.pa_ea_disclaimer_sp

    await Translation.update({ en: pa_ea_email_text_en, es: pa_ea_email_text_sp }, { where: { keyvalue: "t_pa_ea_email_text" } })
    await Translation.update({ en: pa_ea_link_en, es: pa_ea_link_sp }, { where: { keyvalue: "t_pa_ea_link" } })
    await Translation.update({ en: pa_ea_subject_en, es: pa_ea_subject_sp }, { where: { keyvalue: "t_pa_ea_subject" } })
    await Translation.update({ en: pa_ea_disclaimer_en, es: pa_ea_disclaimer_sp }, { where: { keyvalue: "t_pa_ea_disclaimer" } })

    res.status(200).json({ status: "success" })
}
// 7. email password
exports.readEmailPasswordContent = async (req, res, next) => {
    let _t = await Translation.findAll({ where: { type: "template", keyvalue: { [Op.like]: "t_pa_ep_%" } } })

    let translations = { en: {}, es: {} }
    _t.forEach(row => {
        translations.en[row.keyvalue] = row.en
        translations.es[row.keyvalue] = row.es
    })

    res.status(200).json(translations)
}
exports.updateEmailPasswordContent = async (req, res, next) => {
    const pa_ep_subject_en = req.body.pa_ep_subject_en
    const pa_ep_subject_sp = req.body.pa_ep_subject_sp
    const pa_ep_emailtext_en = req.body.pa_ep_emailtext_en
    const pa_ep_emailtext_sp = req.body.pa_ep_emailtext_sp
    const pa_ep_linktime_en = req.body.pa_ep_linktime_en
    const pa_ep_linktime_sp = req.body.pa_ep_linktime_sp
    const pa_ep_notexisted_en = req.body.pa_ep_notexisted_en
    const pa_ep_notexisted_sp = req.body.pa_ep_notexisted_sp
    const pa_ep_alert_success_en = req.body.pa_ep_alert_success_en
    const pa_ep_alert_success_sp = req.body.pa_ep_alert_success_sp

    await Translation.update({ en: pa_ep_subject_en, es: pa_ep_subject_sp }, { where: { keyvalue: "t_pa_ep_subject" } })
    await Translation.update({ en: pa_ep_emailtext_en, es: pa_ep_emailtext_sp }, { where: { keyvalue: "t_pa_ep_emailtext" } })
    await Translation.update({ en: pa_ep_linktime_en, es: pa_ep_linktime_sp }, { where: { keyvalue: "t_pa_ep_linktime" } })
    await Translation.update({ en: pa_ep_notexisted_en, es: pa_ep_notexisted_sp }, { where: { keyvalue: "t_pa_ep_notexisted" } })
    await Translation.update({ en: pa_ep_alert_success_en, es: pa_ep_alert_success_sp }, { where: { keyvalue: "t_pa_ep_alert_success" } })

    res.status(200).json({ status: "success" })
}
// 8. email update
exports.readEmailUpdateContent = async (req, res, next) => {
    let _t = await Translation.findAll({ where: { type: "template", keyvalue: { [Op.like]: "t_pa_eu_%" } } })

    let translations = { en: {}, es: {} }
    _t.forEach(row => {
        translations.en[row.keyvalue] = row.en
        translations.es[row.keyvalue] = row.es
    })

    res.status(200).json(translations)
}
exports.updateEmailUpdateContent = async (req, res, next) => {
    const pa_eu_subject_en = req.body.pa_eu_subject_en
    const pa_eu_subject_sp = req.body.pa_eu_subject_sp
    const pa_eu_etext_en = req.body.pa_eu_etext_en
    const pa_eu_etext_sp = req.body.pa_eu_etext_sp

    await Translation.update({ en: pa_eu_subject_en, es: pa_eu_subject_sp }, { where: { keyvalue: "t_pa_eu_subject" } })
    await Translation.update({ en: pa_eu_etext_en, es: pa_eu_etext_sp }, { where: { keyvalue: "t_pa_eu_etext" } })

    res.status(200).json({ status: "success" })
}
// 9. email closed
exports.readEmailCloseContent = async (req, res, next) => {
    let _t = await Translation.findAll({ where: { type: "template", keyvalue: { [Op.like]: "t_pa_ec_%" } } })

    let translations = { en: {}, es: {} }
    _t.forEach(row => {
        translations.en[row.keyvalue] = row.en
        translations.es[row.keyvalue] = row.es
    })

    res.status(200).json(translations)
}
exports.updateEmailCloseContent = async (req, res, next) => {
    const pa_ec_subject_en = req.body.pa_ec_subject_en
    const pa_ec_subject_sp = req.body.pa_ec_subject_sp
    const pa_ec_etext_en = req.body.pa_ec_etext_en
    const pa_ec_etext_sp = req.body.pa_ec_etext_sp

    await Translation.update({ en: pa_ec_subject_en, es: pa_ec_subject_sp }, { where: { keyvalue: "t_pa_ec_subject" } })
    await Translation.update({ en: pa_ec_etext_en, es: pa_ec_etext_sp }, { where: { keyvalue: "t_pa_ec_etext" } })

    res.status(200).json({ status: "success" })
}
// 10. access help
exports.readNeedHelpContent = async (req, res, next) => {
    let _t = await Translation.findAll({ where: { type: "template", keyvalue: { [Op.like]: "t_pa_ah_%" } } })

    let translations = { en: {}, es: {} }
    _t.forEach(row => {
        translations.en[row.keyvalue] = row.en
        translations.es[row.keyvalue] = row.es
    })

    res.status(200).json(translations)
}
exports.updateNeedHelpContent = async (req, res, next) => {
    const pa_ah_invalid_en = req.body.pa_ah_invalid_en
    const pa_ah_invalid_sp = req.body.pa_ah_invalid_sp
    const pa_ah_help_en = req.body.pa_ah_help_en
    const pa_ah_help_sp = req.body.pa_ah_help_sp
    const pa_ah_hques_en = req.body.pa_ah_hques_en
    const pa_ah_hques_sp = req.body.pa_ah_hques_sp
    const pa_ah_facc_en = req.body.pa_ah_facc_en
    const pa_ah_facc_sp = req.body.pa_ah_facc_sp
    const pa_ah_fpwd_en = req.body.pa_ah_fpwd_en
    const pa_ah_fpwd_sp = req.body.pa_ah_fpwd_sp
    const pa_ah_desc_en = req.body.pa_ah_desc_en
    const pa_ah_desc_sp = req.body.pa_ah_desc_sp
    const pa_ah_rpheader_en = req.body.pa_ah_rpheader_en
    const pa_ah_rpheader_sp = req.body.pa_ah_rpheader_sp
    const pa_ah_ques_en = req.body.pa_ah_ques_en
    const pa_ah_ques_sp = req.body.pa_ah_ques_sp
    const pa_ah_alert_success_en = req.body.pa_ah_alert_success_en
    const pa_ah_alert_success_sp = req.body.pa_ah_alert_success_sp
    const pa_ah_alert_failed_en = req.body.pa_ah_alert_failed_en
    const pa_ah_alert_failed_sp = req.body.pa_ah_alert_failed_sp
    const pa_ah_alert_notexisted_en = req.body.pa_ah_alert_notexisted_en
    const pa_ah_alert_notexisted_sp = req.body.pa_ah_alert_notexisted_sp

    await Translation.update({ en: pa_ah_invalid_en, es: pa_ah_invalid_sp }, { where: { keyvalue: "t_pa_ah_invalid" } })
    await Translation.update({ en: pa_ah_help_en, es: pa_ah_help_sp }, { where: { keyvalue: "t_pa_ah_help" } })
    await Translation.update({ en: pa_ah_hques_en, es: pa_ah_facc_sp }, { where: { keyvalue: "t_pa_ah_facc" } })
    await Translation.update({ en: pa_ah_facc_en, es: pa_ah_hques_sp }, { where: { keyvalue: "t_pa_ah_hques" } })
    await Translation.update({ en: pa_ah_fpwd_en, es: pa_ah_desc_sp }, { where: { keyvalue: "t_pa_ah_desc" } })
    await Translation.update({ en: pa_ah_desc_en, es: pa_ah_fpwd_sp }, { where: { keyvalue: "t_pa_ah_fpwd" } })
    await Translation.update({ en: pa_ah_rpheader_en, es: pa_ah_rpheader_sp }, { where: { keyvalue: "t_pa_ah_rpheader" } })
    await Translation.update({ en: pa_ah_ques_en, es: pa_ah_ques_sp }, { where: { keyvalue: "t_pa_ah_ques" } })
    await Translation.update({ en: pa_ah_alert_success_en, es: pa_ah_alert_success_sp }, { where: { keyvalue: "t_pa_ah_alert_success" } })
    await Translation.update({ en: pa_ah_alert_failed_en, es: pa_ah_alert_failed_sp }, { where: { keyvalue: "t_pa_ah_alert_failed" } })
    await Translation.update({ en: pa_ah_alert_notexisted_en, es: pa_ah_alert_notexisted_sp }, { where: { keyvalue: "t_pa_ah_alert_notexisted" } })

    res.status(200).json({ status: "success" })
}
// 11. vault
exports.readVaultContent = async (req, res, next) => {
    let _t = await Translation.findAll({ where: { type: "template", keyvalue: { [Op.like]: "t_pa_v_%" } } })

    let translations = { en: {}, es: {} }
    _t.forEach(row => {
        translations.en[row.keyvalue] = row.en
        translations.es[row.keyvalue] = row.es
    })

    res.status(200).json(translations)
}
exports.updateVaultContent = async (req, res, next) => {
    const pa_v_welcome_en = req.body.pa_v_welcome_en
    const pa_v_welcome_sp = req.body.pa_v_welcome_sp
    const pa_v_desc_en = req.body.pa_v_desc_en
    const pa_v_desc_sp = req.body.pa_v_desc_sp
    const pa_v_htext_en = req.body.pa_v_htext_en
    const pa_v_htext_sp = req.body.pa_v_htext_sp
    const pa_v_alert_success_en = req.body.pa_v_alert_success_en
    const pa_v_alert_success_sp = req.body.pa_v_alert_success_sp
    const pa_v_alert_failed_en = req.body.pa_v_alert_failed_en
    const pa_v_alert_failed_sp = req.body.pa_v_alert_failed_sp

    await Translation.update({ en: pa_v_welcome_en, es: pa_v_welcome_sp }, { where: { keyvalue: "t_pa_v_welcome" } })
    await Translation.update({ en: pa_v_desc_en, es: pa_v_desc_sp }, { where: { keyvalue: "t_pa_v_desc" } })
    await Translation.update({ en: pa_v_htext_en, es: pa_v_htext_sp }, { where: { keyvalue: "t_pa_v_htext" } })
    await Translation.update({ en: pa_v_alert_success_en, es: pa_v_alert_success_sp }, { where: { keyvalue: "t_pa_v_alert_success" } })
    await Translation.update({ en: pa_v_alert_failed_en, es: pa_v_alert_failed_sp }, { where: { keyvalue: "t_pa_v_alert_failed" } })

    res.status(200).json({ status: "success" })
}
