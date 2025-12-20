
const { DataTypes } = require('sequelize')
const { sequelize } = require('./index')

export const FRPriority = sequelize.define("f_r_priority", {
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
