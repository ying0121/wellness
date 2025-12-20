
const { Op } = require("sequelize")
const Icons = require("../../models/Icons")

exports.read = async (req, res, next) => {
    const name = req.body.name

    const icons = await Icons.findAll({ where: { name: { [Op.like]: `%${name}%` } } })

    res.status(200).json(icons)
}

exports.create = async (req, res, next) => {
    const name = req.body.name

    // check if is already existed
    const icon = await Icons.findOne({ where: { name: name } })

    if (icon) {
        return res.status(200).json({ status: "existed" })
    } else {
        await Icons.create({ name })

        return res.status(200).json({ status: "success" })
    }
}

exports.update = async (req, res, next) => {
    const id = req.body.id
    const name = req.body.name

    // check if is already existed
    const icon = await Icons.findOne({ where: { name: name, id: { [Op.ne]: id } } })

    if (icon) {
        return res.status(200).json({ status: "existed" })
    } else {
        await Icons.create({ name })

        return res.status(200).json({ status: "success" })
    }
}

exports.delete = async (req, res, next) => {
    const id = req.body.id

    await Icons.destroy({ where: { id: id } })

    res.status(200).json({ status: "success" })
}
