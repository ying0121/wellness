
const { DataTypes } = require('sequelize')
const { sequelize } = require('./index')

const MedCondition = sequelize.define("medconditions", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    name: { type: DataTypes.STRING(236) },
    codes: { type: DataTypes.TEXT },
}, {
    engine: "MyISAM",
    timestamps: true
})

module.exports = MedCondition
