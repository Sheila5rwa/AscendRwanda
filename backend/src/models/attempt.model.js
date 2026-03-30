module.exports = (sequelize, DataTypes) => {
  const Attempt = sequelize.define('Attempt', {
    attempt_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    student_id: { type: DataTypes.INTEGER, allowNull: false },
    content_id: { type: DataTypes.INTEGER, allowNull: false },
    score: { type: DataTypes.INTEGER },
    total_possible: { type: DataTypes.INTEGER },
    answers: { type: DataTypes.JSON },
    attempted_at: { type: DataTypes.DATE },
    completed_at: { type: DataTypes.DATE },
  }, {
    tableName: 'attempts',
    timestamps: false,
  });
  return Attempt;
};
