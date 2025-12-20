
const { DataTypes } = require('sequelize')
const { sequelize } = require('./index')

const SurveyRes = sequelize.define("survey_res", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    key: DataTypes.STRING(256),
    en_name: DataTypes.TEXT,
    es_name: DataTypes.TEXT,
    status: DataTypes.TINYINT
}, {
    engine: "MyISAM",
    timestamps: true
})

module.exports = SurveyRes
