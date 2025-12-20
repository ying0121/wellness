
const { DataTypes } = require('sequelize')
const { sequelize } = require('./index')

const PageVideo= sequelize.define("pagevideos", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    video: { type: DataTypes.STRING(256) },
    page: { type: DataTypes.STRING(256) },
    position: { type: DataTypes.STRING(256) },
    status: { type: DataTypes.TINYINT }
}, {
    engine: "MyISAM",
    timestamps: true
})

module.exports = PageVideo
