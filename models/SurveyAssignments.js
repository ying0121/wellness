
const { DataTypes } = require('sequelize')
const { sequelize } = require('./index')

export const SurveyAssignments = sequelize.define("survey_assignments", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    survey_id: DataTypes.INTEGER,
    patient_id: DataTypes.INTEGER,
    status: DataTypes.INTEGER,
    assigned_date: DataTypes.DATE,
    complection_date: DataTypes.DATE,
    staff_id: DataTypes.INTEGER
}, {
    engine: "MyISAM",
    timestamps: true
})
