
const { DataTypes } = require('sequelize')
const { sequelize } = require('./index')

const SocialMedia = sequelize.define("social_media", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    img: {
        type: DataTypes.STRING(256)
    },
    url: {
        type: DataTypes.STRING(256)
    },
    status: {
        type: DataTypes.TINYINT
    }
}, {
    engine: "MyISAM",
    timestamps: true
})

module.exports = SocialMedia
