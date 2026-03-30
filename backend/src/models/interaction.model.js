module.exports = (sequelize, DataTypes) => {
  const Interaction = sequelize.define('Interaction', {
    interaction_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    employer_id: { type: DataTypes.INTEGER, allowNull: false },
    student_id: { type: DataTypes.INTEGER, allowNull: false },
    interaction_type: {
      type: DataTypes.ENUM('message', 'interview', 'feedback', 'selection'),
      allowNull: false,
    },
    content: { type: DataTypes.TEXT },
    scheduled_at: { type: DataTypes.DATE },
  }, {
    tableName: 'employer_student_interactions',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  });
  return Interaction;
};
