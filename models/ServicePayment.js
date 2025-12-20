
const { DataTypes } = require('sequelize')
const { sequelize } = require('./index')

export const ServicePayment= sequelize.define("service_payments", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    payment_method: {
        type: DataTypes.STRING(32),
        defaultValue: 'online',
    },
    payment_reference: DataTypes.STRING(128),
    amount: DataTypes.FLOAT,
    currency: {
        type: DataTypes.STRING(32),
        defaultValue: 'usd',
    },
    status: {
        type: DataTypes.STRING(32),
        defaultValue: 'pending',
    },
    paid_by: DataTypes.INTEGER(11),
    paid_for_service_id: DataTypes.INTEGER(11),
    paid_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    notes: DataTypes.TEXT,
}, {
    engine: "MyISAM",
    timestamps: true
})
