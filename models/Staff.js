
const { DataTypes } = require('sequelize')
const { sequelize } = require('./index')

const Staff= sequelize.define("staffs", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    en_name: DataTypes.STRING(64),
    es_name: DataTypes.STRING(64),
    email: DataTypes.STRING(64),
    tel: DataTypes.STRING(64),
    ext: DataTypes.STRING(64),
    en_job: DataTypes.STRING(64),
    es_job: DataTypes.STRING(64),
    en_desc: DataTypes.TEXT,
    es_desc: DataTypes.TEXT,
    en_fdesc: DataTypes.TEXT,
    es_fdesc: DataTypes.TEXT,
    img: DataTypes.STRING(256),
    status: DataTypes.TINYINT,
    email_tel_ext_toggle: DataTypes.TINYINT,
    send_message_toggle: DataTypes.TINYINT,
    account_request: {
        type: DataTypes.TINYINT,
        defaultValue: 0
    },
    general_online: {
        type: DataTypes.TINYINT,
        defaultValue: 0
    },
    spec_message: {
        type: DataTypes.TINYINT,
        defaultValue: 0
    }

}, {
    engine: "MyISAM",
    timestamps: true
})

module.exports = Staff
