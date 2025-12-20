
const { DataTypes } = require('sequelize')
const { sequelize } = require('./index')

export const FComTable = sequelize.define("f_com_table", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    identifier: DataTypes.STRING(100),
    pt_emrid: DataTypes.STRING(45),
    instantiatesCanonical: DataTypes.TEXT,
    instantiatesUri: DataTypes.TEXT,
    basedOn: DataTypes.TEXT,
    partOf: DataTypes.TEXT,
    inResponseTo: DataTypes.TEXT,
    status: DataTypes.TEXT,
    statusReason: DataTypes.TEXT,
    category: DataTypes.TEXT,
    priority: DataTypes.TEXT,
    medium: DataTypes.TEXT,
    subject: DataTypes.TEXT,
    topic: DataTypes.TEXT,
    about: DataTypes.TEXT,
    encounterid: DataTypes.TEXT,
    sent: DataTypes.TEXT,
    received: DataTypes.TEXT,
    recipient: DataTypes.STRING(150),
    sender: DataTypes.INTEGER,
    reasonCode: DataTypes.TEXT,
    reasonReference: DataTypes.TEXT,
    payload: DataTypes.TEXT,
    content: DataTypes.TEXT,
    contentString: DataTypes.TEXT,
    contentAttachment: DataTypes.TEXT,
    contentReference: DataTypes.TEXT,
    note: DataTypes.TEXT,
    assign: DataTypes.TEXT,
    assign2: DataTypes.TEXT,
    sendirect: DataTypes.INTEGER,
    casenumber: DataTypes.STRING(150),
    clinicid: DataTypes.INTEGER
}, {
    engine: "MyISAM",
    timestamps: true
})
