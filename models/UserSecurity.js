
const { DataTypes } = require('sequelize')
const { sequelize } = require('./index')

const UserSecurity = sequelize.define("user_security", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    user_id: DataTypes.INTEGER,
    user_type: DataTypes.STRING(128),
    question_id: DataTypes.INTEGER,
    answer: DataTypes.STRING(256)
}, {
    engine: "MyISAM",
    timestamps: true
})

module.exports = UserSecurity
