
const { DataTypes } = require('sequelize')
const { sequelize } = require('./index')

const TrackComments = sequelize.define("trackcomments", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    trackid: DataTypes.INTEGER,
    userid: DataTypes.INTEGER,
    comment: DataTypes.TEXT,
    created: DataTypes.DATE
}, {
    engine: "MyISAM",
    timestamps: true
})

module.exports = TrackComments
