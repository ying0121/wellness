
const { DataTypes } = require('sequelize')
const { sequelize } = require('./index')

const Icons = sequelize.define("icons", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    name: DataTypes.STRING(768),
}, {
    engine: "MyISAM",
    timestamps: true
})


module.exports = Icons
