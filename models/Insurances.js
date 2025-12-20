
const { DataTypes } = require('sequelize')
const { sequelize } = require('./index')

const Insurances = sequelize.define("insurances", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    insurance_id: DataTypes.INTEGER,
    name: DataTypes.STRING(256),
    email: DataTypes.STRING(256),
    phone: DataTypes.STRING(64),
    fax: DataTypes.STRING(64),
    address: DataTypes.STRING(256),
    city: DataTypes.STRING(128),
    state: DataTypes.STRING(32),
    zip: DataTypes.STRING(32),
    img: DataTypes.STRING(256),
    status: DataTypes.TINYINT,
}, {
    engine: "MyISAM",
    timestamps: true
})

module.exports = Insurances
