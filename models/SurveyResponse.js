
const { DataTypes } = require('sequelize')
const { sequelize } = require('./index')

export const SurveyResponse = sequelize.define("survey_response", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    patient_id: { type: DataTypes.INTEGER, allowNull: true },
    survey_id: { type: DataTypes.INTEGER, allowNull: true },
    question_id: { type: DataTypes.INTEGER, allowNull: true },
    response_value: { type: DataTypes.STRING(256), allowNull: true },
    response_text1: { type: DataTypes.TEXT, allowNull: true },
    response_text2: { type: DataTypes.TEXT, allowNull: true },
    response_text3: { type: DataTypes.TEXT, allowNull: true },
    response_date: { type: DataTypes.DATE, allowNull: true }
}, {
    engine: "MyISAM",
    timestamps: true
})
