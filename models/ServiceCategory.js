
const { DataTypes } = require('sequelize')
const { sequelize } = require('./index')

const ServiceCategory= sequelize.define("service_categories", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    name: DataTypes.STRING(256),
    desc: DataTypes.TEXT,
    status: {
        type: DataTypes.TINYINT,
        defaultValue: 1,
    },
}, {
    engine: "MyISAM",
    timestamps: true
})

module.exports = ServiceCategory
