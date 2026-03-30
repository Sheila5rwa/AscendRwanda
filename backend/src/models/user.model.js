module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    user_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    first_name: { type: DataTypes.STRING(50), allowNull: false },
    last_name: { type: DataTypes.STRING(50), allowNull: false },
    dob: { type: DataTypes.DATEONLY },
    national_id: { type: DataTypes.STRING(20), unique: true },
    phone_number: { type: DataTypes.STRING(15) },
    email: { type: DataTypes.STRING(50), unique: true },
    password_hash: { type: DataTypes.STRING(255), allowNull: false },
    role: {
      type: DataTypes.ENUM('student', 'mentor', 'admin', 'program_admin', 'employer'),
      allowNull: false,
    },
    guardian_id: { type: DataTypes.INTEGER },
  }, {
    tableName: 'users',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  });
  return User;
};
