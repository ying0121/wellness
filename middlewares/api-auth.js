const jwt = require("jsonwebtoken")

module.exports = (req, res, next) => {
    const authHeader = req.headers.authorization
    if (!authHeader || authHeader.split(' ')[0] !== 'Bearer') {
        return res.status(401).json({ status: 'error', message: 'Unauthorized' })
    }
    const token = authHeader.split(' ')[1]

    if (!token) {
        return res.status(401).json({ status: 'error', message: 'Unauthorized' })
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    if (!decoded) {
        return res.status(401).json({ status: 'error', message: 'Unauthorized' })
    }
    req.user = decoded
    next()
}
