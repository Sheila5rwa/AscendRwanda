const db = require('../models');
const Module = db.Module;
const Content = db.Content;
const Question = db.Question;

// ─── FR 5: Create Module ──────────────────────────────────────────────────────
exports.createModule = async (req, res) => {
  try {
    const { title, description, language, duration_minutes } = req.body;
    const module = await Module.create({ title, description, language, duration_minutes });
    res.status(201).json(module);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── FR 2: Get All Modules ────────────────────────────────────────────────────
exports.getAllModules = async (req, res) => {
  try {
    const modules = await Module.findAll({
      attributes: {
        include: [
          [
            db.sequelize.literal(`(
              SELECT COUNT(*)
              FROM student_progress AS p
              WHERE p.module_id = LearningModule.module_id
            )`),
            'studentCount'
          ]
        ]
      },
      include: [{ model: Content, include: [Question] }],
      order: [['created_at', 'ASC']],
    });
    res.status(200).json(modules);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── FR 2: Get Module By ID ───────────────────────────────────────────────────
exports.getModuleById = async (req, res) => {
  try {
    const module = await Module.findByPk(req.params.id, {
      include: [{ model: Content, include: [Question] }],
    });
    if (!module) return res.status(404).json({ message: 'Module not found.' });
    res.status(200).json(module);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── FR 5: Update Module ──────────────────────────────────────────────────────
exports.updateModule = async (req, res) => {
  try {
    const module = await Module.findByPk(req.params.id);
    if (!module) return res.status(404).json({ message: 'Module not found.' });

    const { title, description, language, duration_minutes } = req.body;
    await module.update({ title, description, language, duration_minutes });
    res.status(200).json({ message: 'Module updated.', module });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── FR 5: Delete Module ──────────────────────────────────────────────────────
exports.deleteModule = async (req, res) => {
  try {
    const module = await Module.findByPk(req.params.id);
    if (!module) return res.status(404).json({ message: 'Module not found.' });
    await module.destroy();
    res.status(200).json({ message: 'Module deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── FR 5: Add Content to Module ─────────────────────────────────────────────
exports.addContent = async (req, res) => {
  try {
    const { module_id, title, content_type, content_data, order_index } = req.body;

    // Check module exists
    const module = await Module.findByPk(module_id);
    if (!module) return res.status(404).json({ message: 'Module not found.' });

    const content = await Content.create({
      module_id,
      title,
      content_type,
      content_data,
      order_index: order_index || 0,
      created_by: req.userId,
    });
    res.status(201).json(content);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── FR 5: Get Single Content Item ───────────────────────────────────────────
exports.getContentById = async (req, res) => {
  try {
    const content = await Content.findByPk(req.params.id, {
      include: [Question],
    });
    if (!content) return res.status(404).json({ message: 'Content not found.' });
    res.status(200).json(content);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── FR 5: Update Content ─────────────────────────────────────────────────────
exports.updateContent = async (req, res) => {
  try {
    const content = await Content.findByPk(req.params.id);
    if (!content) return res.status(404).json({ message: 'Content not found.' });

    const { title, content_type, content_data, order_index } = req.body;
    await content.update({ title, content_type, content_data, order_index });
    res.status(200).json({ message: 'Content updated.', content });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── FR 5: Delete Content ─────────────────────────────────────────────────────
exports.deleteContent = async (req, res) => {
  try {
    const content = await Content.findByPk(req.params.id);
    if (!content) return res.status(404).json({ message: 'Content not found.' });
    await content.destroy();
    res.status(200).json({ message: 'Content deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── FR 5: Add Question to Content ───────────────────────────────────────────
exports.addQuestion = async (req, res) => {
  try {
    const { content_id, question_text, question_type, options, correct_answer, marks } = req.body;

    const content = await Content.findByPk(content_id);
    if (!content) return res.status(404).json({ message: 'Content not found.' });
    if (content.content_type === 'note') {
      return res.status(400).json({ message: 'Cannot add questions to a note.' });
    }

    const question = await Question.create({
      content_id,
      question_text,
      question_type,
      options,
      correct_answer,
      marks: marks || 1,
    });
    res.status(201).json(question);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── FR 5: Update Question ────────────────────────────────────────────────────
exports.updateQuestion = async (req, res) => {
  try {
    const question = await Question.findByPk(req.params.id);
    if (!question) return res.status(404).json({ message: 'Question not found.' });

    const { question_text, question_type, options, correct_answer, marks } = req.body;
    await question.update({ question_text, question_type, options, correct_answer, marks });
    res.status(200).json({ message: 'Question updated.', question });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── FR 5: Delete Question ────────────────────────────────────────────────────
exports.deleteQuestion = async (req, res) => {
  try {
    const question = await Question.findByPk(req.params.id);
    if (!question) return res.status(404).json({ message: 'Question not found.' });
    await question.destroy();
    res.status(200).json({ message: 'Question deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── FR 2.2: Offline Bundle (all content for a module in one payload) ─────────
exports.getOfflineBundle = async (req, res) => {
  try {
    const module = await Module.findByPk(req.params.id, {
      include: [
        {
          model: Content,
          include: [
            {
              model: Question,
              // Exclude correct_answer from offline bundle for security
              attributes: ['question_id', 'content_id', 'question_text', 'question_type', 'options', 'marks'],
            },
          ],
          order: [['order_index', 'ASC']],
        },
      ],
    });

    if (!module) return res.status(404).json({ message: 'Module not found.' });

    res.status(200).json({
      module_id: module.module_id,
      title: module.title,
      description: module.description,
      language: module.language,
      duration_minutes: module.duration_minutes,
      contents: module.Contents,
      cached_at: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
