const { Sequelize, DataTypes } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

let sequelize;

if (process.env.DATABASE_URL) {
  // Use the connection URI provided by Render / Aiven
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'mysql',
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    },
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  });
} else {
  // Fallback to local individual environment variables
  sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
      host: process.env.DB_HOST,
      dialect: 'mysql',
      logging: false,
      pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000,
      },
    }
  );
}

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

// ── Load models ────────────────────────────────────────────────────────────
db.User        = require('./user.model')(sequelize, DataTypes);
db.Module      = require('./module.model')(sequelize, DataTypes);
db.Content     = require('./content.model')(sequelize, DataTypes);
db.Question    = require('./question.model')(sequelize, DataTypes);
db.Progress    = require('./progress.model')(sequelize, DataTypes);
db.Attempt     = require('./attempt.model')(sequelize, DataTypes);
db.Certificate = require('./certificate.model')(sequelize, DataTypes);
db.Mentorship  = require('./mentorship.model')(sequelize, DataTypes);
db.Interaction = require('./interaction.model')(sequelize, DataTypes);

// ── Student ↔ Progress ────────────────────────────────────────────────────
db.User.hasMany(db.Progress, { foreignKey: 'student_id' });
db.Progress.belongsTo(db.User, { foreignKey: 'student_id' });

// ── Module ↔ Progress ─────────────────────────────────────────────────────
db.Module.hasMany(db.Progress, { foreignKey: 'module_id' });
db.Progress.belongsTo(db.Module, { foreignKey: 'module_id' });

// ── Module ↔ Content ──────────────────────────────────────────────────────
db.Module.hasMany(db.Content, { foreignKey: 'module_id' });
db.Content.belongsTo(db.Module, { foreignKey: 'module_id' });

// ── Content creator (admin/lecturer) ──────────────────────────────────────
db.User.hasMany(db.Content, { as: 'CreatedContent', foreignKey: 'created_by' });
db.Content.belongsTo(db.User, { as: 'Creator', foreignKey: 'created_by' });

// ── Content ↔ Questions ───────────────────────────────────────────────────
db.Content.hasMany(db.Question, { foreignKey: 'content_id' });
db.Question.belongsTo(db.Content, { foreignKey: 'content_id' });

// ── Student ↔ Attempts ────────────────────────────────────────────────────
db.User.hasMany(db.Attempt, { foreignKey: 'student_id' });
db.Attempt.belongsTo(db.User, { foreignKey: 'student_id' });

db.Content.hasMany(db.Attempt, { foreignKey: 'content_id' });
db.Attempt.belongsTo(db.Content, { foreignKey: 'content_id' });

// ── Student ↔ Certificates ────────────────────────────────────────────────
db.User.hasMany(db.Certificate, { foreignKey: 'student_id' });
db.Certificate.belongsTo(db.User, { foreignKey: 'student_id' });

db.Module.hasMany(db.Certificate, { foreignKey: 'module_id' });
db.Certificate.belongsTo(db.Module, { foreignKey: 'module_id' });

// ── Mentorship (Mentor ↔ Student) ─────────────────────────────────────────
db.User.hasMany(db.Mentorship, { as: 'MentoredStudents', foreignKey: 'mentor_id' });
db.User.hasMany(db.Mentorship, { as: 'AssignedMentors',  foreignKey: 'student_id' });
db.Mentorship.belongsTo(db.User, { as: 'Mentor',  foreignKey: 'mentor_id' });
db.Mentorship.belongsTo(db.User, { as: 'Student', foreignKey: 'student_id' });

// ── Employer ↔ Student Interactions ──────────────────────────────────────
db.User.hasMany(db.Interaction, { as: 'EmployerInteractions', foreignKey: 'employer_id' });
db.User.hasMany(db.Interaction, { as: 'StudentInteractions',  foreignKey: 'student_id' });
db.Interaction.belongsTo(db.User, { as: 'Employer', foreignKey: 'employer_id' });
db.Interaction.belongsTo(db.User, { as: 'Student',  foreignKey: 'student_id' });

module.exports = db;
