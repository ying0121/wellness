
const { DataTypes } = require('sequelize')
const { sequelize } = require('./index')

const ServiceCategory = require("./ServiceCategory")

const ClinicService = sequelize.define("clinic_services", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    title: DataTypes.TEXT,
    language: DataTypes.INTEGER,
    category: DataTypes.INTEGER,
    short_desc: DataTypes.TEXT,
    long_desc: DataTypes.TEXT,
    image: DataTypes.TEXT,
    video: DataTypes.TEXT,
    status: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 1
    },
    show_on_home: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 0
    },
    show_loc_home: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 0
    },
    show_in_email: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 0
    },
    show_loc_email: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 0
    },
    show_in_banner: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 0
    },
    show_loc_banner: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 0
    },
    show_in_ad: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 0
    },
    show_loc_ad: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 0
    },
    request_service: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 0
    },
    online_payment: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 0
    },
    home_page: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 0
    },
    cost: DataTypes.FLOAT,
    discount: DataTypes.FLOAT,
    currency: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "USD"
    },
    code: DataTypes.STRING,
}, {
    engine: "MyISAM",
    timestamps: true
})

ClinicService.belongsTo(ServiceCategory, {foreignKey: "category", as: "serviceCategory"})

module.exports = ClinicService
