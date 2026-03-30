module.exports = (sequelize, DataTypes) => {
  const Progress = sequelize.define('Progress', {
    progress_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    student_id: { type: DataTypes.INTEGER, allowNull: false },
    module_id: { type: DataTypes.INTEGER, allowNull: false },
    status: {
      type: DataTypes.ENUM('not_started', 'in_progress', 'completed'),
      defaultValue: 'not_started',
    },
    score: { type: DataTypes.INTEGER },
    completed_contents: { type: DataTypes.JSON, defaultValue: [] },
    flagged: { type: DataTypes.BOOLEAN, defaultValue: false },
    started_at: { type: DataTypes.DATE },
    completed_at: { type: DataTypes.DATE },
  }, {
    tableName: 'student_progress',
    timestamps: false,
  });
  return Progress;
};
