
const { DataTypes } = require('sequelize')
const { sequelize } = require('./index')

const NewsletterImage = sequelize.define("newsletterimages", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    name: { type: DataTypes.STRING(256) },
    image: { type: DataTypes.STRING(256) },
    status: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 1
    }
}, {
    engine: "MyISAM",
    timestamps: true
})

module.exports = NewsletterImage
