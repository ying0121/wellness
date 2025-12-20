
const { DataTypes } = require('sequelize')
const { sequelize } = require('./index')

const CommunicationTrack = sequelize.define("communication_tracks", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    case_number: DataTypes.INTEGER,
    message: DataTypes.TEXT,
    patient_id: DataTypes.INTEGER,
    staff_id: DataTypes.INTEGER,
    person_type: DataTypes.STRING,
    created_time: DataTypes.DATE,
    seen: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 0
    },
    recieved: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 1
    }
}, {
    engine: "MyISAM",
    timestamps: true
})

module.exports = CommunicationTrack
