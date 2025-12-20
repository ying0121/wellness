
const { DataTypes } = require('sequelize')
const { sequelize } = require('./index')

const EducationDoc = sequelize.define("education_docs", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    tag: DataTypes.STRING(192),
    title_en: DataTypes.STRING(768),
    title_es: DataTypes.STRING(768),
    desc_en: DataTypes.TEXT,
    desc_es: DataTypes.TEXT,
    url_en: DataTypes.STRING(768),
    url_es: DataTypes.STRING(768),
    status: DataTypes.TINYINT,
}, {
    engine: "MyISAM",
    timestamps: true
})

module.exports = EducationDoc
