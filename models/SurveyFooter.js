
const { DataTypes } = require('sequelize')
const { sequelize } = require('./index')

const SurveyFooter = sequelize.define("survey_footers", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    en: DataTypes.TEXT,
    es: DataTypes.TEXT
}, {
    engine: "MyISAM",
    timestamps: true
})

module.exports = SurveyFooter
