
const { DataTypes } = require('sequelize')
const { sequelize } = require('./index')

export const SurveySent = sequelize.define("survey_sent", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    case_id: { type: DataTypes.INTEGER, allowNull: true },
    pt_id: { type: DataTypes.INTEGER, allowNull: true },
    survey_name: { type: DataTypes.STRING(256), allowNull: true },
    created_at: { type: DataTypes.DATE, allowNull: true },
    updated_at: { type: DataTypes.DATE, allowNull: true }
}, {
    engine: "MyISAM",
    timestamps: true
})
