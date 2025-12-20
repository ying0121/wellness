
const { DataTypes } = require('sequelize')
const { sequelize } = require('./index')

const API = sequelize.define("apis", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    url: DataTypes.TEXT,

}, {
    engine: "MyISAM",
    timestamps: true
})

module.exports = API
