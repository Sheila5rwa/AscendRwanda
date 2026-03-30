const db = require('../models');
const User = db.User;
const Module = db.Module;
const Progress = db.Progress;
const Certificate = db.Certificate;
const Mentorship = db.Mentorship;
const Interaction = db.Interaction;
const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');

// ─── FR Admin: List All Users (filterable by role) ───────────────────────────
exports.getAllUsers = async (req, res) => {
  try {
    const { role } = req.query;
    const where = role ? { role } : {};
    const users = await User.findAll({
      where,
      attributes: { exclude: ['password_hash'] },
      order: [['created_at', 'DESC']],
    });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── FR Admin: Get User By ID ─────────────────────────────────────────────────
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password_hash'] },
      include: [
        { model: Progress, include: [Module] },
        { model: Certificate, include: [Module] },
      ],
    });
    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── FR Admin: Update Any User ────────────────────────────────────────────────
exports.updateUser = async (req, res) => {
  try {
    const { first_name, last_name, email, phone_number, role, dob, national_id } = req.body;
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    await user.update({ first_name, last_name, email, phone_number, role, dob, national_id });
    const updated = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password_hash'] },
    });
    res.status(200).json({ message: 'User updated.', user: updated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── FR Admin: Delete User ────────────────────────────────────────────────────
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });
    await user.destroy();
    res.status(200).json({ message: 'User deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── FR Admin: Reset User Password ───────────────────────────────────────────
exports.resetUserPassword = async (req, res) => {
  try {
    const { new_password } = req.body;
    if (!new_password || new_password.length < 6) {
      return res.status(400).json({ message: 'new_password must be at least 6 characters.' });
    }
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });
    await user.update({ password_hash: bcrypt.hashSync(new_password, 8) });
    res.status(200).json({ message: 'Password reset successfully.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── FR Admin: Assign Mentor to Student (FR 4) ───────────────────────────────
exports.assignMentorToStudent = async (req, res) => {
  try {
    const { mentor_id, student_id } = req.body;
    if (!mentor_id || !student_id) {
      return res.status(400).json({ message: 'mentor_id and student_id are required.' });
    }

    const mentor = await User.findByPk(mentor_id);
    const student = await User.findByPk(student_id);

    if (!mentor || mentor.role !== 'mentor') {
      return res.status(400).json({ message: 'mentor_id does not belong to a mentor.' });
    }
    if (!student || student.role !== 'student') {
      return res.status(400).json({ message: 'student_id does not belong to a student.' });
    }

    const [mentorship, created] = await Mentorship.findOrCreate({
      where: { mentor_id, student_id },
      defaults: { flagged: false },
    });

    res.status(created ? 201 : 200).json({
      message: created ? 'Mentor assigned successfully.' : 'Mentorship already exists.',
      mentorship,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── FR Admin: Dashboard Statistics ──────────────────────────────────────────
exports.getDashboardStats = async (req, res) => {
  try {
    const [
      totalStudents,
      totalMentors,
      totalEmployers,
      totalAdmins,
      totalModules,
      completedModules,
      inProgressModules,
      flaggedStudents,
      totalCertificates,
      totalInteractions,
    ] = await Promise.all([
      User.count({ where: { role: 'student' } }),
      User.count({ where: { role: 'mentor' } }),
      User.count({ where: { role: 'employer' } }),
      User.count({ where: { role: { [Op.in]: ['admin', 'program_admin'] } } }),
      Module.count(),
      Progress.count({ where: { status: 'completed' } }),
      Progress.count({ where: { status: 'in_progress' } }),
      Mentorship.count({ where: { flagged: true } }),
      Certificate.count(),
      Interaction.count(),
    ]);

    res.status(200).json({
      users: {
        students: totalStudents,
        mentors: totalMentors,
        employers: totalEmployers,
        admins: totalAdmins,
        total: totalStudents + totalMentors + totalEmployers + totalAdmins,
      },
      modules: {
        total: totalModules,
        completed_enrollments: completedModules,
        in_progress_enrollments: inProgressModules,
      },
      flagged_students: flaggedStudents,
      certificates_issued: totalCertificates,
      employer_interactions: totalInteractions,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── FR Admin: All Student Progress (FR 5.1) ─────────────────────────────────
exports.getAllStudentProgress = async (req, res) => {
  try {
    const progress = await Progress.findAll({
      include: [
        { model: User, attributes: { exclude: ['password_hash'] } },
        { model: Module },
      ],
      order: [['student_id', 'ASC']],
    });
    res.status(200).json(progress);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── FR Admin: List All Certificates ──────────────────────────────────────────
exports.getAllCertificates = async (req, res) => {
  try {
    const certs = await Certificate.findAll({
      include: [
        { model: User, attributes: ['first_name', 'last_name', 'user_id'] },
        { model: Module, attributes: ['title'] },
      ],
      order: [['issued_at', 'DESC']],
    });
    res.status(200).json(certs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

