module.exports = (sequelize, DataTypes) => {
  const Content = sequelize.define('Content', {
    content_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    module_id: { type: DataTypes.INTEGER, allowNull: false },
    title: { type: DataTypes.STRING(100), allowNull: false },
    content_type: { type: DataTypes.ENUM('note', 'quiz', 'exam'), allowNull: false },
    content_data: { type: DataTypes.TEXT('long') },
    // FR 2.1: order_index supports 15-min segmented lesson ordering
    order_index: { type: DataTypes.INTEGER, defaultValue: 0 },
    created_by: { type: DataTypes.INTEGER },
  }, {
    tableName: 'contents',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  });
  return Content;
};
