
const { DataTypes } = require('sequelize')
const { sequelize } = require('./index')

const Setting = sequelize.define("setting", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    type: {
        type: DataTypes.STRING(256),
        allowNull: false
    },
    value: {
        type: DataTypes.STRING(256),
        allowNull: false
    }
}, {
    engine: "MyISAM",
    timestamps: true
})

module.exports = Setting
