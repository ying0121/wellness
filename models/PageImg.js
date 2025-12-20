
const { DataTypes } = require('sequelize')
const { sequelize } = require('./index')

const PageImg= sequelize.define("pageimg", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    page: { type: DataTypes.STRING(256) },
    position: { type: DataTypes.STRING(256) },
    img: { type: DataTypes.STRING(256) },
    title_en: { type: DataTypes.TEXT },
    title_es: { type: DataTypes.TEXT },
    desc_en: { type: DataTypes.TEXT },
    desc_es: { type: DataTypes.TEXT },
    status: { type: DataTypes.TINYINT }
}, {
    engine: "MyISAM",
    timestamps: true
})

module.exports = PageImg
