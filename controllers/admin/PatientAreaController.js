
const moment = require("moment")

const AreaToggle = require("../../models/AreaToggle")
const Translation = require("../../models/Translation")
const ContactInfo = require("../../models/ContactInfo")
const API = require("../../models/API")
const FVsLanguage = require("../../models/FVsLanguage")
const Staff = require("../../models/Staff")
const SurveyData = require("../../models/SurveyData")
const FComContact = require("../../models/FComContact")

const { Op } = require("sequelize")

exports.render = async (req, res, next) => {
	let data = {}

	data.sideItem = "patient-areas"
	data.site_url = process.env.SITE_URL
	data.prefix = process.env.PREFIX_URL
	data.menus = req.session.adminUser.access_rights
	data.userType = req.session.adminUser.type
	data.loginTime = req.session.loginTime
	data.expiredTime = req.session.expiredTime
	data.userFullName = req.session.adminUser.fname + " " + req.session.adminUser.lname
    data.public_key = process.env.ENCRYPT_PUBLIC_KEY

	const _a = await AreaToggle.findAll()
	data.area_toggle = {}
	_a.forEach(item => { data.area_toggle[item.area_id] = item.status })

	const _t = await Translation.findAll()
	data.component= []
	_t.forEach(item => { data.component[item.keyvalue] = [], data.component[item.keyvalue].en = item.en, data.component[item.keyvalue].es = item.es })

	data.contact_info = await ContactInfo.findOne({ where: { id: 1 } })
    data.acronym = data.contact_info.acronym

    data.api = await API.findAll()

    data.languages = await FVsLanguage.findAll()

    data.staffs = await Staff.findAll()

    data.survey = await SurveyData.findAll()

    data.statistic = { total: 0, open: 0, inprogress: 0, close: 0 }
    data.statistic.total = await FComContact.count({ where: { new_status: 1 } })
    data.statistic.open = await FComContact.count({ where: { new_status: 1, status: 1 } })
    data.statistic.inprogress = await FComContact.count({ where: { new_status: 1, status: 2 } })
    data.statistic.close = await FComContact.count({ where: { new_status: 1, status: 3 } })
	
	res.render('admin/patient_areas', data)
}

exports.getReports = async (req, res, next) => {
    const dayType = parseInt(req.body.dayType)
    const year = parseInt(req.body.year)
    const month = parseInt(req.body.month)
    const date = req.body.date

    let requests = { dayType: "", data: [], staffs: [], reasons: [] }
    const staffs = await Staff.findAll({ attributes: ["id", "en_name"] })
    requests.staffs.push({ id: "Nobody", en_name: "Nobody" })
    staffs.forEach(s => {
        requests.staffs.push(s.dataValues)
    })
    requests.reasons = ["Appointment Request", "Letter Request", "Prescription Refill Request", "Referral Request", "Test Results Request", "General Message"]

    if (dayType === 1) { // Monthly
        requests.dayType = "monthly"

        for (let i = 1; i <= 12; i++) {
            let start_date = moment(`${year}-${String(i).padStart(2, "0")}-01 00:00:01`)
            let end_date = moment(`${year}-${String(i).padStart(2, "0")}-31 23:59:59`)

            let month_request = []
            for (const staff of requests.staffs) {
                let staff_request = []
                for (const reason of requests.reasons) {
                    const count = await FComContact.count({ where: { assign: staff.id, reason, date: { [Op.between]: [start_date.toDate(), end_date.toDate()] }, new_status: 1 } })
                    staff_request.push({ reason, count })
                }
                month_request.push({ assign: staff.id, data: staff_request })
            }
            requests.data.push(month_request)
        }
    } else if (dayType === 2) { // Bi-Weekly
        requests.dayType = "biweekly"

        // Before (1–15)
        let start_date = moment(`${year}-${String(month).padStart(2, "0")}-01 00:00:01`)
        let end_date = moment(`${year}-${String(month).padStart(2, "0")}-15 23:59:59`)

        let before_request = []
        for (const staff of requests.staffs) {
            let staff_request = []
            for (const reason of requests.reasons) {
                const count = await FComContact.count({ where: { assign: staff.id, reason, date: { [Op.between]: [start_date.toDate(), end_date.toDate()] }, new_status: 1 } })
                staff_request.push({ reason, count })
            }
            before_request.push({ assign: staff.id, data: staff_request })
        }
        requests.data.push(before_request)

        // After (16–31)
        start_date = moment(`${year}-${String(month).padStart(2, "0")}-16 00:00:01`)
        end_date = moment(`${year}-${String(month).padStart(2, "0")}-31 23:59:59`)

        let after_request = []
        for (const staff of requests.staffs) {
            let staff_request = []
            for (const reason of requests.reasons) {
                const count = await FComContact.count({ where: { assign: staff.id, reason, date: { [Op.between]: [start_date.toDate(), end_date.toDate()] }, new_status: 1 } })
                staff_request.push({ reason, count })
            }
            after_request.push({ assign: staff.id, data: staff_request })
        }
        requests.data.push(after_request)
    } else if (dayType === 3) { // Weekly
        requests.dayType = "weekly"

        const daysInMonth = moment(`${year}-${month}`, "YYYY-MM").daysInMonth()

        let weeks = []

        for (let day = 1; day <= daysInMonth; day++) {
            let currentDate = moment(`${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`)

            if (currentDate.isoWeekday() === 1) { // Monday
                let startOfWeek = currentDate.clone().startOf("day")
                let endOfWeek = currentDate.clone().add(6, "days").endOf("day")
                weeks.push({
                    start: startOfWeek.format("YYYY-MM-DD HH:mm:ss"),
                    end: endOfWeek.format("YYYY-MM-DD HH:mm:ss")
                })
            }
        }

        for (const week of weeks) {
            let week_request = []
            for (const staff of requests.staffs) {
                let staff_request = []
                for (const reason of requests.reasons) {
                    const count = await FComContact.count({ where: { assign: staff.id, reason, date: { [Op.between]: [week.start, week.end] }, new_status: 1 } })
                    staff_request.push({ reason, count })
                }
                week_request.push({ assign: staff.id, data: staff_request })
            }
            requests.data.push(week_request)
        }
    } else if (dayType === 4) { // Daily
        requests.dayType = "daily"

        let start_date = moment(`${date} 00:00:01`)
        let end_date = moment(`${date} 23:59:59`)

        for (const staff of requests.staffs) {
            let staff_request = []
            for (const reason of requests.reasons) {
                const count = await FComContact.count({ where: { assign: staff.id, reason, date: { [Op.between]: [start_date.toDate(), end_date.toDate()] }, new_status: 1 } })
                staff_request.push({ reason, count })
            }
            requests.data.push({ assign: staff.id, data: staff_request })
        }
    }

    res.status(200).json(requests)
}
