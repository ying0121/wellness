
const { DataTypes } = require('sequelize')
const { sequelize } = require('./index')

const SurveyData = sequelize.define("surveydata", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    en_sub: { type: DataTypes.STRING(512), allowNull: true },
    es_sub: { type: DataTypes.STRING(512), allowNull: true },
    en_desc: { type: DataTypes.TEXT, allowNull: true },
    es_desc: { type: DataTypes.TEXT, allowNull: true },
    quiz: { type: DataTypes.TEXT, allowNull: true },
    res: { type: DataTypes.TEXT, allowNull: true },
    created: { type: DataTypes.DATEONLY, allowNull: true },
    status: { type: DataTypes.TINYINT, allowNull: true }
}, {
    engine: "MyISAM",
    timestamps: true
})

module.exports = SurveyData
