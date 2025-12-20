
const { DataTypes } = require('sequelize')
const { sequelize } = require('./index')

const Managers = require("./Managers")

const AlertClinic = sequelize.define("alert_clinics", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    title: DataTypes.STRING,
    title_es: DataTypes.STRING,
    description: DataTypes.TEXT,
    description_es: DataTypes.TEXT,
    message: DataTypes.TEXT,
    message_es: DataTypes.TEXT,
    status: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 1
    },
    start: DataTypes.DATE,
    end: DataTypes.DATE,
    sent: DataTypes.TINYINT,
    type: DataTypes.STRING,
    method: DataTypes.INTEGER,
    image: DataTypes.TEXT,
    image_actived: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 0
    },
    created_by: DataTypes.STRING

}, {
    engine: "MyISAM",
    timestamps: true
})

AlertClinic.belongsTo(Managers, { foreignKey: "created_by" })

module.exports = AlertClinic
