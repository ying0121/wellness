
module.exports = (req, res, next) => {
    if (!req.session.isAdminLogin) {
        return res.redirect(process.env.PREFIX_URL)
    }
    next()
}
