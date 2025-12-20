
const { DataTypes } = require('sequelize')
const { sequelize } = require('./index')

const Staff = require("./Staff");
const PatientList = require('./PatientList');

const FComContact = sequelize.define("f_com_contacts", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    identifier: DataTypes.INTEGER,
    pt_emr_id: DataTypes.INTEGER,
    clinic_id: DataTypes.INTEGER,
    type: DataTypes.INTEGER,
    case_number: DataTypes.INTEGER,
    based_on: DataTypes.STRING(256),
    part_of: DataTypes.STRING(256),
    status: DataTypes.INTEGER,
    category: DataTypes.STRING(256),
    priority: DataTypes.INTEGER,
    medium: DataTypes.INTEGER,
    subject: DataTypes.STRING(256),
    topic: DataTypes.INTEGER,
    about: DataTypes.TEXT,
    encounter_id: DataTypes.INTEGER,
    sent: DataTypes.DATE,
    received: DataTypes.DATEONLY,
    recipient: DataTypes.STRING(256),
    sender: DataTypes.STRING(256),
    turn_round: DataTypes.STRING(256),
    assign: DataTypes.STRING(128),
    content_string: DataTypes.STRING(256),
    content_attachment: DataTypes.STRING(256),
    content_reference: DataTypes.STRING(256),
    note: DataTypes.TEXT,
    patient_type: DataTypes.INTEGER,
    reason: DataTypes.STRING(256),
    name: DataTypes.STRING(256),
    dob: DataTypes.DATEONLY,
    email: DataTypes.STRING(256),
    cel: DataTypes.STRING(256),
    message: DataTypes.TEXT,
    opt_status: DataTypes.INTEGER,
    survey_id: DataTypes.INTEGER,
    lang: DataTypes.STRING(256),
    best_time: DataTypes.STRING(256),
    date: DataTypes.DATE,
    closed_date: DataTypes.DATE,
    new_status: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 1
    },
    pt_unread_count: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    sf_unread_count: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    m_delivered: {
        type: DataTypes.TINYINT,
        allowNull: false
    },
    m_seen: {
        type: DataTypes.TINYINT,
        allowNull: false
    },
    msg_type: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 1
    }
}, {
    engine: "MyISAM",
    timestamps: true
})

FComContact.belongsTo(Staff, { foreignKey: 'assign', as: 'staff' });
FComContact.belongsTo(PatientList, { foreignKey: 'pt_emr_id', as: 'patient' });

module.exports = FComContact
