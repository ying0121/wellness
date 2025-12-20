
const { DataTypes } = require('sequelize')
const { sequelize } = require('./index')

const WorkingHour = sequelize.define("working_hours", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    en_name: DataTypes.STRING(32),
    es_name: DataTypes.STRING(32),
    en_time: DataTypes.STRING(32),
    es_time: DataTypes.STRING(32),
    status: DataTypes.TINYINT
}, {
    engine: "MyISAM",
    timestamps: true
})

module.exports = WorkingHour
