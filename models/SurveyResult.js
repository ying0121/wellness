
const { DataTypes } = require('sequelize')
const { sequelize } = require('./index')

const SurveyResult = sequelize.define("surveyresults", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    surveyid: { type: DataTypes.INTEGER, allowNull: true },
    quiz: { type: DataTypes.TEXT, allowNull: true },
    res: { type: DataTypes.TEXT, allowNull: true },
    value: { type: DataTypes.TEXT, allowNull: true },
    created: { type: DataTypes.DATEONLY, allowNull: true },
    status: { type: DataTypes.TINYINT, allowNull: true }
}, {
    engine: "MyISAM",
    timestamps: true
})

module.exports = SurveyResult
