
const AreaToggle = require("../models/AreaToggle")

exports.choose = async (req, res, next) => {
	const area_id = req.body.area_id
    const areaToggle = await AreaToggle.findOne({ where: { area_id: area_id } })
    res.status(200).json(areaToggle)
}

exports.update = async (req, res, next) => {
    const area_id = req.body.area_id
    const status = req.body.status
    await AreaToggle.update({ status }, { where: { area_id: area_id } })
    res.status(200).send("ok")
}

