
const { DataTypes } = require('sequelize')
const { sequelize } = require('./index')

const PaymentStripe = sequelize.define("payment_stripes", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    stripe: DataTypes.TEXT,
}, {
    engine: "MyISAM",
    timestamps: true
})

module.exports = PaymentStripe
