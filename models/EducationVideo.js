
const { DataTypes } = require('sequelize')
const { sequelize } = require('./index')

const EducationVideo = sequelize.define("education_videos", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    tag: DataTypes.STRING(192),
    title_en: DataTypes.STRING(768),
    title_es: DataTypes.STRING(768),
    url_en: DataTypes.STRING(768),
    url_es: DataTypes.STRING(768),
    status: DataTypes.TINYINT,
}, {
    engine: "MyISAM",
    timestamps: true
})

module.exports = EducationVideo
