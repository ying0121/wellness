
const { DataTypes } = require('sequelize')
const { sequelize } = require('./index')

const SurveyCat = require('./SurveyCat')

const SurveyQuestion = sequelize.define("survey_questions", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    category: DataTypes.INTEGER,
    en_name: DataTypes.STRING(512),
    es_name: DataTypes.STRING(512),
    status: DataTypes.TINYINT
}, {
    engine: "MyISAM",
    timestamps: true
})

SurveyQuestion.belongsTo(SurveyCat, { foreignKey: "category", as: "surveyData" })

module.exports = SurveyQuestion
