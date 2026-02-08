exports.render = async (req, res, next) => {
    let data = {}

    data.sideItem = "precheck"
    data.site_url = process.env.SITE_URL
    data.prefix = process.env.PREFIX_URL
    data.menus = req.session.adminUser.access_rights
    data.userType = req.session.adminUser.type
    data.loginTime = req.session.loginTime
    data.expiredTime = req.session.expiredTime
    data.userFullName = req.session.adminUser.fname + " " + req.session.adminUser.lname

    res.render('admin/prechecks', data)
}
