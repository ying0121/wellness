
const { DataTypes } = require('sequelize')
const { sequelize } = require('./index')

const SurveyCat = sequelize.define("survey_cats", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    en_name: DataTypes.STRING(512),
    es_name: DataTypes.STRING(512),
    status: DataTypes.TINYINT
}, {
    engine: "MyISAM",
    timestamps: true
})

module.exports = SurveyCat
