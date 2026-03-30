module.exports = (sequelize, DataTypes) => {
  const LearningModule = sequelize.define('LearningModule', {
    module_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: { type: DataTypes.STRING(100), allowNull: false },
    description: { type: DataTypes.TEXT },
    language: { type: DataTypes.ENUM('Kinyarwanda', 'English'), defaultValue: 'English' },
    duration_minutes: { type: DataTypes.INTEGER },
  }, {
    tableName: 'learning_modules',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  });
  return LearningModule;
};
