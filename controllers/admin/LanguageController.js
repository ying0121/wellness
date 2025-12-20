
const FVsLanguage = require("../../models/FVsLanguage")

exports.read = async (req, res, next) => {
    const languages = await FVsLanguage.findAll()

    res.status(200).json({ data: languages })
}
