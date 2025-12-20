
const { DataTypes } = require('sequelize')
const { sequelize } = require('./index')

const FVsLanguage = sequelize.define("f_vs_languages", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    code: { type: DataTypes.STRING(255), allowNull: false },
    Dansk: DataTypes.STRING(255),
    Deutsch: DataTypes.STRING(255),
    English: DataTypes.STRING(255),
    Nederlands: DataTypes.STRING(255),
    Polskie: DataTypes.STRING(255),
    Русский: DataTypes.STRING(255),
    中文: DataTypes.STRING(255),
}, {
    engine: "MyISAM",
    timestamps: true
})

module.exports = FVsLanguage
