
const { DataTypes } = require('sequelize')
const { sequelize } = require('./index')

export const ServiceInvoice= sequelize.define("service_invoice", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    invoice_number: DataTypes.STRING(64),
    patient_id: DataTypes.INTEGER(11),
    clinic_id: DataTypes.INTEGER(11),
    total_amount: DataTypes.FLOAT,
    status: {
        type: DataTypes.STRING(32),
        defaultValue: 'unpaid',
    },
    issued_date: DataTypes.DATE,
    due_date: DataTypes.DATE,
    paid_date: DataTypes.DATE,
    notes: DataTypes.TEXT,
}, {
    engine: "MyISAM",
    timestamps: true
})
