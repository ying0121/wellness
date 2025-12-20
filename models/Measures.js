
const { DataTypes } = require('sequelize')
const { sequelize } = require('./index')

const QualityCat = require("./QualityCat")

const Measures= sequelize.define("measures", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    catid: { type: DataTypes.INTEGER },
    measure_en: { type: DataTypes.STRING(236) },
    measure_es: { type: DataTypes.STRING(256) },
    denominator: { type: DataTypes.STRING(32) },
    numerator: { type: DataTypes.STRING(32) },
    desc_en: { type: DataTypes.TEXT },
    desc_es: { type: DataTypes.TEXT },
    fdesc_en: { type: DataTypes.TEXT },
    fdesc_es: { type: DataTypes.TEXT },
    sdate: { type: DataTypes.STRING(32) },
    edate: { type: DataTypes.STRING(32) },
    status: { type: DataTypes.TINYINT }
}, {
    engine: "MyISAM",
    timestamps: true
})

Measures.belongsTo(QualityCat, { foreignKey: 'catid' });
QualityCat.hasMany(Measures, { foreignKey: 'catid' });

module.exports = Measures
