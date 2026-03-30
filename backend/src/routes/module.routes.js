const express = require('express');
const router = express.Router();
const controller = require('../controllers/module.controller');
const { authMiddleware, isAdmin } = require('../middleware/auth.middleware');
const {
  validate,
  moduleRules,
  contentRules,
  questionRules,
} = require('../middleware/validation.middleware');

// Helper: admin OR lecturer (program_admin) can manage content (FR 5)
const isAdminOrLecturer = (req, res, next) => {
  if (['admin', 'program_admin', 'mentor'].includes(req.userRole)) return next();
  return res.status(403).json({ message: 'Require Admin or Lecturer role.' });
};

// ── Public / Authenticated ──────────────────────────────────────────────────
router.get('/', controller.getAllModules);                                    // List all modules
router.get('/:id', controller.getModuleById);                                // Get module by ID
router.get('/:id/offline-bundle', authMiddleware, controller.getOfflineBundle); // FR 2.2

// ── Admin-only: Modules CRUD ────────────────────────────────────────────────
router.post('/', [authMiddleware, isAdmin, ...moduleRules, validate], controller.createModule);
router.put('/:id', [authMiddleware, isAdmin, validate], controller.updateModule);
router.delete('/:id', [authMiddleware, isAdmin], controller.deleteModule);

// ── Admin/Lecturer: Content CRUD ────────────────────────────────────────────
router.post('/content/add', [authMiddleware, isAdminOrLecturer, ...contentRules, validate], controller.addContent);
router.get('/content/:id', authMiddleware, controller.getContentById);
router.put('/content/:id', [authMiddleware, isAdminOrLecturer, validate], controller.updateContent);
router.delete('/content/:id', [authMiddleware, isAdminOrLecturer], controller.deleteContent);

// ── Admin/Lecturer: Question CRUD ───────────────────────────────────────────
router.post('/question/add', [authMiddleware, isAdminOrLecturer, ...questionRules, validate], controller.addQuestion);
router.put('/question/:id', [authMiddleware, isAdminOrLecturer, validate], controller.updateQuestion);
router.delete('/question/:id', [authMiddleware, isAdminOrLecturer], controller.deleteQuestion);

module.exports = router;
