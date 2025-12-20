
const { DataTypes } = require('sequelize')
const { sequelize } = require('./index')

const ContactInfo = sequelize.define("contactinfos", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    name: DataTypes.STRING,
    address: DataTypes.STRING,
    acronym: DataTypes.STRING,
    city: DataTypes.STRING,
    state: DataTypes.STRING,
    zip: DataTypes.STRING,
    tel: DataTypes.STRING,
    fax: DataTypes.STRING,
    email: DataTypes.STRING,
    domain: DataTypes.STRING,
    portal: DataTypes.STRING,
    portal_show: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 0
    },
    status: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 1
    },
}, {
    engine: "MyISAM",
    timestamps: true
})

module.exports = ContactInfo
