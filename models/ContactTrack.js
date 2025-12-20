
const { DataTypes } = require('sequelize')
const { sequelize } = require('./index')

export const ContactTrack = sequelize.define("contact_track", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    type: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 0
    },
    patient_type: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 0
    },
    reason: DataTypes.STRING,
    name: DataTypes.STRING,
    dob: DataTypes.DATE,
    email: DataTypes.STRING,
    cel: DataTypes.STRING,
    subject: DataTypes.STRING,
    message: DataTypes.TEXT,
    patient_type: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 0
    },
    date: DataTypes.DATE,
    assign: DataTypes.INTEGER,
    backup: DataTypes.INTEGER,
    status: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 0
    },
    priority: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 0
    },
    lang: DataTypes.STRING,
    besttime: DataTypes.STRING,
}, {
    engine: "MyISAM",
    timestamps: true
})
