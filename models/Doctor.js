
const { DataTypes } = require('sequelize')
const { sequelize } = require('./index')

const Doctor = sequelize.define("doctors", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    en_name: DataTypes.STRING,
    es_name: DataTypes.STRING,
    email: DataTypes.STRING,
    tel: DataTypes.STRING,
    ext: DataTypes.STRING,
    en_job: DataTypes.STRING,
    es_job: DataTypes.STRING,
    en_desc: DataTypes.TEXT,
    es_desc: DataTypes.TEXT,
    en_fdesc: DataTypes.TEXT,
    es_fdesc: DataTypes.TEXT,
    img: DataTypes.STRING,
    status: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 0
    },
    send_message_toggle: DataTypes.TINYINT,
    email_tel_ext_toggle: DataTypes.TINYINT,
    npi: DataTypes.STRING,
    specialty: DataTypes.STRING,
    license: DataTypes.STRING,
    license_state: DataTypes.STRING,
    license_start: DataTypes.DATEONLY,
    license_end: DataTypes.DATEONLY,
    dea: DataTypes.STRING,
    dea_start: DataTypes.DATEONLY,
    dea_end: DataTypes.DATEONLY,
}, {
    engine: "MyISAM",
    timestamps: true
})

module.exports = Doctor
