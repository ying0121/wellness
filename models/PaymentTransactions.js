
const { DataTypes } = require('sequelize')
const { sequelize } = require('./index')

const PaymentTransactions= sequelize.define("payment_transactions", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    category: DataTypes.STRING(32),
    category_id: DataTypes.INTEGER(11),
    payment_id: DataTypes.STRING(128),
    payment_method: DataTypes.STRING(128),
    name: DataTypes.STRING(32),
    email: DataTypes.STRING(128),
    phone: DataTypes.STRING(64),
    country: DataTypes.STRING(32),
    amount: DataTypes.FLOAT,
    currency: {
        type: DataTypes.STRING(32),
        defaultValue: 'usd',
    },
    brand: DataTypes.STRING(32),
    card_number: DataTypes.STRING(16),
    expired_date: DataTypes.STRING(32),
    status: DataTypes.STRING(32),
}, {
    engine: "MyISAM",
    timestamps: true
})

module.exports = PaymentTransactions
