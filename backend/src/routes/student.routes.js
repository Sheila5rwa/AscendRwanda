const express = require('express');
const router = express.Router();
const controller = require('../controllers/student.controller');
const { authMiddleware } = require('../middleware/auth.middleware');

router.use(authMiddleware);

// FR 2: Module enrollment
router.post('/start-module', controller.startModule);            // POST /api/students/start-module
router.post('/complete-module', controller.completeModule);     // POST /api/students/complete-module

// FR 2 / FR 3: Quiz/Exam submission with auto-cert
router.post('/submit-attempt', controller.submitAttempt);       // POST /api/students/submit-attempt

// FR 5.1: Progress tracking
router.get('/progress', controller.getStudentProgress);         // GET /api/students/progress
router.get('/progress/:module_id', controller.getModuleProgress); // GET /api/students/progress/:module_id
router.get('/attempts', controller.getAttemptHistory);          // GET /api/students/attempts

// FR 3: Certificates
router.get('/certificates', controller.getCertificates);        // GET /api/students/certificates
router.get('/certificates/:id/qr', controller.getCertificateQR); // GET /api/students/certificates/:id/qr

// FR 6.2-6.4: Student views employer interactions
router.get('/interactions', controller.getStudentInteractions); // GET /api/students/interactions

module.exports = router;
