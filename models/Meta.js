
const { DataTypes } = require('sequelize')
const { sequelize } = require('./index')

const Meta= sequelize.define("meta", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    meta_title: { type: DataTypes.STRING(256) },
    meta_desc: { type: DataTypes.STRING(256) },
    facebook_title: { type: DataTypes.STRING(256) },
    facebook_desc: { type: DataTypes.STRING(256) },
    twitter_title: { type: DataTypes.STRING(256) },
    twitter_desc: { type: DataTypes.STRING(256) }
}, {
    engine: "MyISAM",
    timestamps: true
})

module.exports = Meta
