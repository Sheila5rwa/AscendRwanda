const db = require('../models');
const Progress = db.Progress;
const Attempt = db.Attempt;
const Certificate = db.Certificate;
const Content = db.Content;
const Question = db.Question;
const Interaction = db.Interaction;
const User = db.User;
const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');

// ─── FR 2: Start Module Enrollment ───────────────────────────────────────────
exports.startModule = async (req, res) => {
  try {
    const { module_id } = req.body;
    if (!module_id) return res.status(400).json({ message: 'module_id is required.' });

    const module = await db.Module.findByPk(module_id);
    if (!module) return res.status(404).json({ message: 'Module not found.' });

    const [progress, created] = await Progress.findOrCreate({
      where: { student_id: req.userId, module_id },
      defaults: { status: 'in_progress', started_at: new Date() },
    });

    if (!created && progress.status === 'not_started') {
      await progress.update({ status: 'in_progress', started_at: new Date() });
    }

    res.status(200).json({ progress, created });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── FR 2: Complete Module (mark all notes read) ──────────────────────────────
exports.completeModule = async (req, res) => {
  try {
    const { module_id } = req.body;
    if (!module_id) return res.status(400).json({ message: 'module_id is required.' });

    const progress = await Progress.findOne({
      where: { student_id: req.userId, module_id },
    });
    if (!progress) {
      return res.status(404).json({ message: 'No progress record found. Start the module first.' });
    }

    // Check that an exam has been passed before marking complete
    const examContent = await Content.findOne({
      where: { module_id, content_type: 'exam' },
    });
    if (examContent) {
      const passedAttempt = await Attempt.findOne({
        where: { student_id: req.userId, content_id: examContent.content_id },
        order: [['completed_at', 'DESC']],
      });
      if (!passedAttempt) {
        return res.status(400).json({
          message: 'You must complete the module exam before the module can be marked complete.',
        });
      }
    }

    await progress.update({ status: 'completed', completed_at: new Date() });
    res.status(200).json({ message: 'Module marked as completed.', progress });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── FR 2 / FR 3: Submit Quiz or Exam Attempt ────────────────────────────────
exports.submitAttempt = async (req, res) => {
  try {
    const { content_id, answers } = req.body;
    if (!content_id || !answers) {
      return res.status(400).json({ message: 'content_id and answers are required.' });
    }

    const content = await Content.findByPk(content_id, { include: [Question] });
    if (!content) return res.status(404).json({ message: 'Content not found.' });

    if (content.content_type === 'note') {
      return res.status(400).json({ message: 'Cannot submit attempt for a note.' });
    }

    // Calculate score
    let score = 0;
    const questions = content.Questions;
    questions.forEach(q => {
      if (answers[String(q.question_id)] === q.correct_answer) {
        score += q.marks;
      }
    });

    const totalPossible = questions.reduce((acc, q) => acc + q.marks, 0);
    const percentage = totalPossible > 0 ? (score / totalPossible) * 100 : 0;
    const PASS_THRESHOLD = 70;

    const attempt = await Attempt.create({
      student_id: req.userId,
      content_id,
      score,
      answers,
      attempted_at: new Date(),
      completed_at: new Date(),
    });

    let certificate = null;
    let flagged = false;

    // If exam, handle pass/fail
    if (content.content_type === 'exam') {
      if (percentage >= PASS_THRESHOLD) {
        // Mark module as completed with score
        await Progress.update(
          { status: 'completed', completed_at: new Date(), score, flagged: false },
          { where: { student_id: req.userId, module_id: content.module_id } }
        );

        // FR 3.1: Auto-generate certificate with QR token
        const existingCert = await Certificate.findOne({
          where: { student_id: req.userId, module_id: content.module_id },
        });

        if (!existingCert) {
          const qrToken = uuidv4(); // Store token, not data URL
          certificate = await Certificate.create({
            student_id: req.userId,
            module_id: content.module_id,
            qr_code: qrToken,
            issued_at: new Date(),
          });
        } else {
          certificate = existingCert;
        }
      } else if (percentage < 50) {
        // Flag for mentor intervention
        flagged = true;
        await Progress.update(
          { flagged: true },
          { where: { student_id: req.userId, module_id: content.module_id } }
        );
        // Also flag on mentorship record if one exists
        await db.Mentorship.update(
          { flagged: true },
          { where: { student_id: req.userId } }
        );
      }
    }

    res.status(200).json({
      attempt,
      score,
      totalPossible,
      percentage: Math.round(percentage),
      passed: percentage >= PASS_THRESHOLD,
      flagged,
      certificate: certificate
        ? { certificate_id: certificate.certificate_id, issued_at: certificate.issued_at }
        : null,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── FR 5.1 / FR 6: Get Student's Own Progress ───────────────────────────────
exports.getStudentProgress = async (req, res) => {
  try {
    const progress = await Progress.findAll({
      where: { student_id: req.userId },
      include: [db.Module],
      order: [['started_at', 'DESC']],
    });
    res.status(200).json(progress);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── FR 5.1: Get Progress for a Specific Module ───────────────────────────────
exports.getModuleProgress = async (req, res) => {
  try {
    const { module_id } = req.params;
    const progress = await Progress.findOne({
      where: { student_id: req.userId, module_id },
      include: [db.Module],
    });
    if (!progress) {
      return res.status(404).json({ message: 'No progress found for this module.' });
    }
    res.status(200).json(progress);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── FR 5.1: Get All Quiz/Exam Attempt History ───────────────────────────────
exports.getAttemptHistory = async (req, res) => {
  try {
    const attempts = await Attempt.findAll({
      where: { student_id: req.userId },
      include: [
        { model: Content, attributes: ['content_id', 'title', 'content_type', 'module_id'] },
      ],
      order: [['completed_at', 'DESC']],
    });
    res.status(200).json(attempts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── FR 3: Get Student Certificates ──────────────────────────────────────────
exports.getCertificates = async (req, res) => {
  try {
    const certificates = await Certificate.findAll({
      where: { student_id: req.userId },
      include: [db.Module],
      order: [['issued_at', 'DESC']],
    });
    res.status(200).json(certificates);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── FR 3: Get QR Code Image for a Certificate ───────────────────────────────
exports.getCertificateQR = async (req, res) => {
  try {
    const cert = await Certificate.findOne({
      where: { certificate_id: req.params.id, student_id: req.userId },
      include: [db.Module],
    });
    if (!cert) return res.status(404).json({ message: 'Certificate not found.' });

    // Generate verification URL using the stored token
    const verificationUrl = `${process.env.BASE_URL || 'http://localhost:3000'}/api/verify/${cert.qr_code}`;
    const qrDataUrl = await QRCode.toDataURL(verificationUrl, { width: 300 });

    res.status(200).json({
      certificate_id: cert.certificate_id,
      qr_image: qrDataUrl,
      verification_url: verificationUrl,
      module: cert.Module ? cert.Module.title : null,
      issued_at: cert.issued_at,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── FR 6.2-6.4: Student Views Employer Interactions ─────────────────────────
exports.getStudentInteractions = async (req, res) => {
  try {
    const interactions = await Interaction.findAll({
      where: { student_id: req.userId },
      include: [
        {
          model: User,
          as: 'Employer',
          attributes: ['user_id', 'first_name', 'last_name', 'email'],
        },
      ],
      order: [['created_at', 'DESC']],
    });
    res.status(200).json(interactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
