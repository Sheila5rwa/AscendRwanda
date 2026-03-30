const db = require('../models');
const Mentorship = db.Mentorship;
const Progress = db.Progress;
const User = db.User;
const Module = db.Module;

// ─── FR 4: Get Mentor's Assigned Students ────────────────────────────────────
exports.getMyStudents = async (req, res) => {
  try {
    const assignments = await Mentorship.findAll({
      where: { mentor_id: req.userId },
      include: [
        {
          model: User,
          as: 'Student',
          attributes: { exclude: ['password_hash'] },
          include: [
            { model: Progress, include: [Module] },
          ],
        },
      ],
      order: [['created_at', 'DESC']],
    });
    res.status(200).json(assignments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── FR 4: Get Single Mentorship Record ──────────────────────────────────────
exports.getMentorshipById = async (req, res) => {
  try {
    const record = await Mentorship.findOne({
      where: { mentorship_id: req.params.id, mentor_id: req.userId },
      include: [
        { model: User, as: 'Student', attributes: { exclude: ['password_hash'] } },
        { model: User, as: 'Mentor', attributes: { exclude: ['password_hash'] } },
      ],
    });
    if (!record) return res.status(404).json({ message: 'Mentorship record not found.' });
    res.status(200).json(record);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── FR 4: Get Flagged Students (from mentorship table) ──────────────────────
exports.getFlaggedStudents = async (req, res) => {
  try {
    const flagged = await Mentorship.findAll({
      where: { mentor_id: req.userId, flagged: true },
      include: [
        {
          model: User,
          as: 'Student',
          attributes: { exclude: ['password_hash'] },
          include: [{ model: Progress, include: [Module] }],
        },
      ],
    });
    res.status(200).json(flagged);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── FR 4: Flag a Student (needs mentor support) ─────────────────────────────
exports.flagStudent = async (req, res) => {
  try {
    const { student_id } = req.params;
    const record = await Mentorship.findOne({
      where: { mentor_id: req.userId, student_id },
    });
    if (!record) {
      return res.status(404).json({ message: 'No mentorship assignment found for this student.' });
    }
    await record.update({ flagged: true });

    // Also flag on progress records
    await Progress.update({ flagged: true }, { where: { student_id } });

    res.status(200).json({ message: 'Student flagged for support.', record });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── FR 4: Unflag a Student ───────────────────────────────────────────────────
exports.unflagStudent = async (req, res) => {
  try {
    const { student_id } = req.params;
    const record = await Mentorship.findOne({
      where: { mentor_id: req.userId, student_id },
    });
    if (!record) {
      return res.status(404).json({ message: 'No mentorship assignment found for this student.' });
    }
    await record.update({ flagged: false });
    await Progress.update({ flagged: false }, { where: { student_id } });

    res.status(200).json({ message: 'Student unflagged.', record });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── FR 4 / FR 5.1: View a Student's Progress (mentor perspective) ────────────
exports.getStudentProgressForMentor = async (req, res) => {
  try {
    const { student_id } = req.params;

    // Verify this mentor is assigned to the student
    const assignment = await Mentorship.findOne({
      where: { mentor_id: req.userId, student_id },
    });
    if (!assignment) {
      return res.status(403).json({ message: 'You are not assigned to this student.' });
    }

    const progress = await Progress.findAll({
      where: { student_id },
      include: [Module],
      order: [['started_at', 'DESC']],
    });

    const student = await User.findByPk(student_id, {
      attributes: { exclude: ['password_hash'] },
    });

    res.status(200).json({ student, progress, mentorship: assignment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── FR 4: Add / Update Mentor Note on a Student ─────────────────────────────
exports.addMentorNote = async (req, res) => {
  try {
    const { student_id, notes } = req.body;
    const record = await Mentorship.findOne({
      where: { mentor_id: req.userId, student_id },
    });
    if (!record) {
      return res.status(404).json({ message: 'No mentorship assignment found for this student.' });
    }
    await record.update({ notes });
    res.status(200).json({ message: 'Note saved.', record });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── FR 4: Remove a Mentorship Assignment ────────────────────────────────────
exports.removeMentorship = async (req, res) => {
  try {
    const record = await Mentorship.findOne({
      where: { mentorship_id: req.params.id, mentor_id: req.userId },
    });
    if (!record) return res.status(404).json({ message: 'Mentorship record not found.' });
    await record.destroy();
    res.status(200).json({ message: 'Mentorship assignment removed.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── FR 4: Assign Mentor (admin delegates this; kept for backward compat) ─────
exports.assignMentor = async (req, res) => {
  try {
    const { student_id, mentor_id } = req.body;
    const [mentorship, created] = await Mentorship.findOrCreate({
      where: { mentor_id, student_id },
      defaults: { flagged: false },
    });
    res.status(created ? 201 : 200).json({
      message: created ? 'Mentor assigned.' : 'Already assigned.',
      mentorship,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
