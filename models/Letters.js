
const { DataTypes } = require('sequelize')
const { sequelize } = require('./index')

const LetterCategories = require("./LetterCategories")
const FVsLanguage = require('./FVsLanguage')

const Letters= sequelize.define("letters", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    language: DataTypes.INTEGER,
    category: DataTypes.INTEGER,
    title: DataTypes.TEXT,
    icon: DataTypes.STRING(256),
    short_desc: DataTypes.TEXT,
    long_desc: DataTypes.TEXT,
    image: DataTypes.TEXT,
    video: DataTypes.TEXT,
    status: { type: DataTypes.TINYINT, defaultValue: 1, allowNull: false },
    show_on_home: DataTypes.TINYINT,
    show_loc_home: DataTypes.TEXT,
    show_in_email: DataTypes.TINYINT,
    show_loc_email: DataTypes.TEXT,
    show_in_banner: DataTypes.TINYINT,
    show_loc_banner: DataTypes.TEXT,
    show_in_ad: DataTypes.TINYINT,
    show_loc_ad: DataTypes.TEXT,
    request_letter: { type: DataTypes.TINYINT, defaultValue: 0, allowNull: false },
    online_payment: { type: DataTypes.TINYINT, defaultValue: 0, allowNull: false },
    cost: { type: DataTypes.FLOAT, defaultValue: 0, allowNull: false },
}, {
    engine: "MyISAM",
    timestamps: true
})

Letters.belongsTo(LetterCategories, { foreignKey: "category", as: "LetterCategories" })
Letters.belongsTo(FVsLanguage, { foreignKey: "language", as: "FVsLanguage" })

module.exports = Letters
