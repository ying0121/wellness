
const { DataTypes } = require('sequelize')
const { sequelize } = require('./index')

const ContactReason = sequelize.define("contact_reasons", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    en_name: DataTypes.STRING,
    sp_name: DataTypes.STRING,
}, {
    engine: "MyISAM",
    timestamps: true
})

module.exports = ContactReason
