const db = require('../models');
const Interaction = db.Interaction;
const Progress = db.Progress;
const Certificate = db.Certificate;
const User = db.User;
const Module = db.Module;
const { Op } = require('sequelize');

// ─── Helper: safe student attributes (no password) ────────────────────────────
const STUDENT_ATTRS = { exclude: ['password_hash'] };

// ─── FR 6: Search / Browse All Students ──────────────────────────────────────
exports.searchStudents = async (req, res) => {
  try {
    const { name, status } = req.query;
    const userWhere = { role: 'student' };

    if (name) {
      userWhere[Op.or] = [
        { first_name: { [Op.like]: `%${name}%` } },
        { last_name: { [Op.like]: `%${name}%` } },
      ];
    }

    const progressWhere = status ? { status } : {};

    const students = await User.findAll({
      where: userWhere,
      attributes: STUDENT_ATTRS,
      include: [
        {
          model: Progress,
          where: Object.keys(progressWhere).length ? progressWhere : undefined,
          required: false,
          include: [Module],
        },
        {
          model: Certificate,
          required: false,
          include: [Module],
        },
      ],
      order: [['last_name', 'ASC']],
    });

    res.status(200).json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── FR 6: Get a Single Student's Full Profile ───────────────────────────────
exports.getStudentProfile = async (req, res) => {
  try {
    const student = await User.findOne({
      where: { user_id: req.params.student_id, role: 'student' },
      attributes: STUDENT_ATTRS,
      include: [
        { model: Progress, include: [Module] },
        { model: Certificate, include: [Module] },
      ],
    });
    if (!student) return res.status(404).json({ message: 'Student not found.' });
    res.status(200).json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── FR 6: View a Student's Progress ─────────────────────────────────────────
exports.getStudentProgressDetails = async (req, res) => {
  try {
    const { student_id } = req.params;
    const student = await User.findOne({
      where: { user_id: student_id, role: 'student' },
      attributes: STUDENT_ATTRS,
    });
    if (!student) return res.status(404).json({ message: 'Student not found.' });

    const progress = await Progress.findAll({
      where: { student_id },
      include: [Module],
      order: [['started_at', 'DESC']],
    });

    res.status(200).json({ student, progress });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── FR 6: View a Student's Certificates ─────────────────────────────────────
exports.getStudentCertificates = async (req, res) => {
  try {
    const { student_id } = req.params;
    const student = await User.findOne({
      where: { user_id: student_id, role: 'student' },
      attributes: STUDENT_ATTRS,
    });
    if (!student) return res.status(404).json({ message: 'Student not found.' });

    const certificates = await Certificate.findAll({
      where: { student_id },
      include: [Module],
      order: [['issued_at', 'DESC']],
    });

    res.status(200).json({ student, certificates });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── FR 6.1: Select a Student (marks interest) ───────────────────────────────
exports.selectStudent = async (req, res) => {
  try {
    const { student_id, content } = req.body;
    if (!student_id) return res.status(400).json({ message: 'student_id is required.' });

    const student = await User.findOne({ where: { user_id: student_id, role: 'student' } });
    if (!student) return res.status(404).json({ message: 'Student not found.' });

    const interaction = await Interaction.create({
      employer_id: req.userId,
      student_id,
      interaction_type: 'selection',
      content: content || `Employer selected this student for further consideration.`,
      scheduled_at: null,
    });
    res.status(201).json({ message: 'Student selected.', interaction });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── FR 6.2: Send Message to Student ─────────────────────────────────────────
exports.sendMessage = async (req, res) => {
  try {
    const { student_id, content } = req.body;
    if (!student_id || !content) {
      return res.status(400).json({ message: 'student_id and content are required.' });
    }

    const student = await User.findOne({ where: { user_id: student_id, role: 'student' } });
    if (!student) return res.status(404).json({ message: 'Student not found.' });

    const interaction = await Interaction.create({
      employer_id: req.userId,
      student_id,
      interaction_type: 'message',
      content,
      scheduled_at: null,
    });
    res.status(201).json({ message: 'Message sent.', interaction });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── FR 6.3: Schedule Interview with Student ─────────────────────────────────
exports.scheduleInterview = async (req, res) => {
  try {
    const { student_id, content, scheduled_at } = req.body;
    if (!student_id || !scheduled_at) {
      return res.status(400).json({ message: 'student_id and scheduled_at are required.' });
    }

    const interviewDate = new Date(scheduled_at);
    if (isNaN(interviewDate.getTime()) || interviewDate < new Date()) {
      return res.status(400).json({ message: 'scheduled_at must be a valid future date.' });
    }

    const student = await User.findOne({ where: { user_id: student_id, role: 'student' } });
    if (!student) return res.status(404).json({ message: 'Student not found.' });

    const interaction = await Interaction.create({
      employer_id: req.userId,
      student_id,
      interaction_type: 'interview',
      content: content || 'Interview scheduled.',
      scheduled_at: interviewDate,
    });
    res.status(201).json({ message: 'Interview scheduled.', interaction });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── FR 6.4: Provide Feedback on Student ─────────────────────────────────────
exports.provideFeedback = async (req, res) => {
  try {
    const { student_id, content } = req.body;
    if (!student_id || !content) {
      return res.status(400).json({ message: 'student_id and content are required.' });
    }

    const student = await User.findOne({ where: { user_id: student_id, role: 'student' } });
    if (!student) return res.status(404).json({ message: 'Student not found.' });

    const interaction = await Interaction.create({
      employer_id: req.userId,
      student_id,
      interaction_type: 'feedback',
      content,
      scheduled_at: null,
    });
    res.status(201).json({ message: 'Feedback submitted.', interaction });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── FR 6: Get All Employer's Interactions ────────────────────────────────────
exports.getInteractions = async (req, res) => {
  try {
    const { type, student_id } = req.query;
    const where = { employer_id: req.userId };
    if (type) where.interaction_type = type;
    if (student_id) where.student_id = student_id;

    const interactions = await Interaction.findAll({
      where,
      include: [
        { model: User, as: 'Student', attributes: STUDENT_ATTRS },
      ],
      order: [['created_at', 'DESC']],
    });
    res.status(200).json(interactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── FR 6: Get a Single Interaction ──────────────────────────────────────────
exports.getInteractionById = async (req, res) => {
  try {
    const interaction = await Interaction.findOne({
      where: { interaction_id: req.params.id, employer_id: req.userId },
      include: [
        { model: User, as: 'Student', attributes: STUDENT_ATTRS },
        { model: User, as: 'Employer', attributes: STUDENT_ATTRS },
      ],
    });
    if (!interaction) return res.status(404).json({ message: 'Interaction not found.' });
    res.status(200).json(interaction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── FR 6: Update an Interaction (e.g., reschedule interview) ────────────────
exports.updateInteraction = async (req, res) => {
  try {
    const interaction = await Interaction.findOne({
      where: { interaction_id: req.params.id, employer_id: req.userId },
    });
    if (!interaction) return res.status(404).json({ message: 'Interaction not found.' });

    const { content, scheduled_at } = req.body;
    await interaction.update({ content, scheduled_at });
    res.status(200).json({ message: 'Interaction updated.', interaction });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── FR 6: Delete an Interaction ─────────────────────────────────────────────
exports.deleteInteraction = async (req, res) => {
  try {
    const interaction = await Interaction.findOne({
      where: { interaction_id: req.params.id, employer_id: req.userId },
    });
    if (!interaction) return res.status(404).json({ message: 'Interaction not found.' });
    await interaction.destroy();
    res.status(200).json({ message: 'Interaction deleted.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Legacy generic interact (backward compat) ────────────────────────────────
exports.interact = async (req, res) => {
  try {
    const { student_id, interaction_type, content, scheduled_at } = req.body;
    const interaction = await Interaction.create({
      employer_id: req.userId,
      student_id,
      interaction_type,
      content,
      scheduled_at,
    });
    res.status(201).json(interaction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
