module.exports = (sequelize, DataTypes) => {
  const Question = sequelize.define('Question', {
    question_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    content_id: { type: DataTypes.INTEGER, allowNull: false },
    question_text: { type: DataTypes.TEXT, allowNull: false },
    question_type: { type: DataTypes.ENUM('MCQ', 'TF', 'Short Answer'), defaultValue: 'MCQ' },
    options: { type: DataTypes.JSON },
    correct_answer: { type: DataTypes.STRING(255) },
    marks: { type: DataTypes.INTEGER, defaultValue: 1 },
  }, {
    tableName: 'questions',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  });
  return Question;
};
