
const { DataTypes } = require('sequelize')
const { sequelize } = require('./index')

const PatientReview= sequelize.define("patient_reviews", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    en_name: DataTypes.STRING(128),
    es_name: DataTypes.STRING(128),
    en_desc: DataTypes.TEXT,
    es_desc: DataTypes.TEXT,
    en_fdesc: DataTypes.TEXT,
    es_fdesc: DataTypes.TEXT,
    img: {
        type: DataTypes.STRING(256),
        defaultValue: "default.jpg",
    },
    status: DataTypes.TINYINT,
}, {
    engine: "MyISAM",
    timestamps: true
})

module.exports = PatientReview
