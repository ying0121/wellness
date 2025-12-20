
const { DataTypes } = require('sequelize')
const { sequelize } = require('./index')

const PatientList= sequelize.define("patient_lists", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    patient_id: { type: DataTypes.INTEGER },
    insurance_id: { type: DataTypes.INTEGER },
    fname: { type: DataTypes.STRING(64) },
    lname: { type: DataTypes.STRING(64) },
    mname: { type: DataTypes.STRING(32) },
    phone: { type: DataTypes.STRING(32) },
    mobile: { type: DataTypes.STRING(32) },
    email: { type: DataTypes.STRING(128) },
    password: { type: DataTypes.STRING(256) },
    address: { type: DataTypes.STRING(256) },
    city: { type: DataTypes.STRING(32) },
    zip: { type: DataTypes.STRING(32) },
    state: { type: DataTypes.STRING(32) },
    gender: { type: DataTypes.STRING(32) },
    dob: { type: DataTypes.DATEONLY, defaultValue: '2000-01-01' },
    language: { type: DataTypes.STRING(32) },
    ethnicity: { type: DataTypes.STRING(32) },
    race: { type: DataTypes.STRING(32) },
    status: { type: DataTypes.TINYINT, defaultValue: 1 },
    login_count: { type: DataTypes.TINYINT, defaultValue: 0 }
}, {
    engine: "MyISAM",
    timestamps: true
})

module.exports = PatientList
