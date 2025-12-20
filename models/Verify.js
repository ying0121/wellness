
const { DataTypes } = require('sequelize')
const { sequelize } = require('./index')

const Verify = sequelize.define("verifies", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    email: DataTypes.STRING(64),
    patient_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    link: DataTypes.TEXT,
    create_time: {
        type: DataTypes.DATE,
        allowNull: false
    }
}, {
    engine: "MyISAM",
    timestamps: true
})

module.exports = Verify
