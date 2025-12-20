
const { DataTypes } = require('sequelize')
const { sequelize } = require('./index')

const PatientList = require('./PatientList')

const Vault = sequelize.define("vaults", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    patient_id: DataTypes.STRING(32),
    title: DataTypes.STRING(256),
    desc: DataTypes.TEXT,
    document: DataTypes.STRING(256),
    submit_date: DataTypes.DATEONLY
}, {
    engine: "MyISAM",
    timestamps: true
})

Vault.belongsTo(PatientList, { foreignKey: 'patient_id', as: "patient" })

module.exports = Vault
