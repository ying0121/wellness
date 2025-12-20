
const { DataTypes } = require('sequelize')
const { sequelize } = require('./index')

export const FESStatus = sequelize.define("f_e_status", {
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
