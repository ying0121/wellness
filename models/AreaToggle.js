
const { DataTypes } = require('sequelize')
const { sequelize } = require('./index')

const AreaToggle = sequelize.define("area_toggles", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    area_id: DataTypes.STRING,
    status: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 1
    },
}, {
    engine: "MyISAM",
    timestamps: true
})

module.exports = AreaToggle
