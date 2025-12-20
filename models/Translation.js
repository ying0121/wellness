
const { DataTypes } = require('sequelize')
const { sequelize } = require('./index')

const Translation = sequelize.define("translations", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    type: DataTypes.STRING,
    keyvalue: DataTypes.STRING,
    en: DataTypes.TEXT,
    es: DataTypes.TEXT,
}, {
    engine: "MyISAM",
    timestamps: true
})

module.exports = Translation
