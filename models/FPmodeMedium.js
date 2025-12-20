
const { DataTypes } = require('sequelize')
const { sequelize } = require('./index')

export const FPmodeMedium = sequelize.define("f_pmode_medium", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    code: DataTypes.TEXT,
    display: DataTypes.TEXT,
    definition: DataTypes.TEXT
}, {
    engine: "MyISAM",
    timestamps: true
})
