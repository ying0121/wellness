
const { DataTypes } = require('sequelize')
const { sequelize } = require('./index')

const FVsLanguage = require("./FVsLanguage")

const LetterCategories = sequelize.define("letter_categories", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    name: DataTypes.STRING(256),
    desc: DataTypes.TEXT,
    status: { type: DataTypes.TINYINT, defaultValue: 1 },
    lang: { type: DataTypes.TINYINT, allowNull: false, defaultValue: 17 },
}, {
    engine: "MyISAM",
    timestamps: true
})

LetterCategories.belongsTo(FVsLanguage, { foreignKey: 'lang', as: "FVsLanguage" })

module.exports = LetterCategories
