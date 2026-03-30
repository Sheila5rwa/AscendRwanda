module.exports = (sequelize, DataTypes) => {
  const Certificate = sequelize.define('Certificate', {
    certificate_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    student_id: { type: DataTypes.INTEGER, allowNull: false },
    module_id: { type: DataTypes.INTEGER, allowNull: false },
    qr_code: { type: DataTypes.STRING(255) },
    issued_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  }, {
    tableName: 'certificates',
    timestamps: false,
  });
  return Certificate;
};
