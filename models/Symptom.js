
const { DataTypes } = require('sequelize')
const { sequelize } = require('./index')

export const Symptom = sequelize.define("symptom", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    name: { type: DataTypes.STRING(256), allowNull: true },
    link: { type: DataTypes.TEXT, allowNull: true },
    img: { type: DataTypes.STRING(128), allowNull: true },
    status: { type: DataTypes.TINYINT, allowNull: true }
}, {
    engine: "MyISAM",
    timestamps: true
})
