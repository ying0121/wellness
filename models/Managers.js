
const { DataTypes } = require('sequelize')
const { sequelize } = require('./index')

const Managers= sequelize.define("managers", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    fname: DataTypes.STRING(32),
    lname: DataTypes.STRING(32),
    email: DataTypes.STRING(128),
    password: DataTypes.STRING(512),
    type: DataTypes.TINYINT,
    access_rights: DataTypes.TEXT,
    status: DataTypes.TINYINT,
}, {
    engine: "MyISAM",
    timestamps: true
})

module.exports = Managers
