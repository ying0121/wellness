
const { DataTypes } = require('sequelize')
const { sequelize } = require('./index')

const QualityCat= sequelize.define("quality_cats", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    en_name: DataTypes.STRING(256),
    es_name: DataTypes.STRING(256),
    status: DataTypes.TINYINT,
}, {
    engine: "MyISAM",
    timestamps: true
})

module.exports = QualityCat
