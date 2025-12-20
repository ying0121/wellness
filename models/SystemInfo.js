
const { DataTypes } = require('sequelize')
const { sequelize } = require('./index')

const SystemInfo = sequelize.define("system_infos", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    info_name: { type: DataTypes.STRING(256), allowNull: true },
    value: { type: DataTypes.STRING(256), allowNull: true }
}, {
    engine: "MyISAM",
    timestamps: true
})

module.exports = SystemInfo
