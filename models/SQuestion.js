
const { DataTypes } = require('sequelize')
const { sequelize } = require('./index')

const SQuestion = sequelize.define("squestion", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    en: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    es: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    status: {
        type: DataTypes.TINYINT,
        allowNull: false
    }
}, {
    engine: "MyISAM",
    timestamps: true
})

module.exports = SQuestion
