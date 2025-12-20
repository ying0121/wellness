
const { DataTypes } = require('sequelize')
const { sequelize } = require('./index')

const LetterDesc = sequelize.define("letter_descs", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    lang: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 17 },
    desc: DataTypes.TEXT,
}, {
    engine: "MyISAM",
    timestamps: true
})

module.exports = LetterDesc
