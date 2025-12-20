
const { DataTypes } = require('sequelize')
const { sequelize } = require('./index')

const Document = sequelize.define("documents", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    page: DataTypes.TEXT,
    en_title: DataTypes.STRING,
    es_title: DataTypes.STRING,
    en_desc: DataTypes.STRING,
    es_desc: DataTypes.STRING,
    en_doc: DataTypes.STRING,
    es_doc: DataTypes.STRING,
    en_size: DataTypes.TEXT,
    es_size: DataTypes.TEXT,
    status: DataTypes.TINYINT
}, {
    engine: "MyISAM",
    timestamps: true
})

module.exports = Document
