
const { DataTypes } = require('sequelize')
const { sequelize } = require('./index')

const NewsletterData = sequelize.define("newsletterdatas", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    en_sub: { type: DataTypes.TEXT },
    es_sub: { type: DataTypes.TEXT },
    en_desc: { type: DataTypes.TEXT },
    es_desc: { type: DataTypes.TEXT },
    author: { type: DataTypes.STRING(256) },
    published: { type: DataTypes.DATE },
    image: { type: DataTypes.STRING(256) },
    med_cond: { type: DataTypes.TEXT },
    gender: { type: DataTypes.TINYINT },
    age_all: { type: DataTypes.TINYINT },
    age_from: { type: DataTypes.INTEGER },
    age_to: { type: DataTypes.INTEGER },
    edu_material: { type: DataTypes.TEXT },
    link: { type: DataTypes.STRING(256) },
    show_contact: { type: DataTypes.TINYINT },
    view_url: { type: DataTypes.STRING(256) },
    status: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 1
    }
}, {
    engine: "MyISAM",
    timestamps: true
})

module.exports = NewsletterData
