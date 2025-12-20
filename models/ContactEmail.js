
const { DataTypes } = require('sequelize')
const { sequelize } = require('./index')

const ContactEmail = sequelize.define("contact_emails", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    contact_name: DataTypes.STRING,
    email: DataTypes.STRING,
    account_request: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 0
    },
    general_online: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 0
    },
    specific_online: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 0
    },
    payment_email: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 0
    }
}, {
    engine: "MyISAM",
    timestamps: true
})

module.exports = ContactEmail
