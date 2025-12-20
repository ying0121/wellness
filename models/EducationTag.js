
const { DataTypes } = require('sequelize')
const { sequelize } = require('./index')

const EducationTag = sequelize.define("education_tags", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    tag: DataTypes.STRING(64),
    en: DataTypes.STRING(128),
    es: DataTypes.STRING(128),
}, {
    engine: "MyISAM",
    timestamps: true
})

module.exports = EducationTag
