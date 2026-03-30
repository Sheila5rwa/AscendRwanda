const express = require('express');
const router = express.Router();
const controller = require('../controllers/employer.controller');
const { authMiddleware, isEmployer } = require('../middleware/auth.middleware');

router.use(authMiddleware, isEmployer);

// FR 6: Browse students (with optional ?name=&status= filters)
router.get('/students', controller.searchStudents);                             // GET  /api/employers/students
router.get('/students/:student_id', controller.getStudentProfile);             // GET  /api/employers/students/:id
router.get('/students/:student_id/progress', controller.getStudentProgressDetails); // GET /api/employers/students/:id/progress
router.get('/students/:student_id/certificates', controller.getStudentCertificates); // GET /api/employers/students/:id/certificates

// FR 6.1: Select a student
router.post('/select', controller.selectStudent);                               // POST /api/employers/select

// FR 6.2: Send message to student
router.post('/message', controller.sendMessage);                               // POST /api/employers/message

// FR 6.3: Schedule interview
router.post('/interview', controller.scheduleInterview);                       // POST /api/employers/interview

// FR 6.4: Provide feedback
router.post('/feedback', controller.provideFeedback);                          // POST /api/employers/feedback

// FR 6: Interaction management
router.get('/interactions', controller.getInteractions);                       // GET  /api/employers/interactions?type=&student_id=
router.get('/interactions/:id', controller.getInteractionById);                // GET  /api/employers/interactions/:id
router.put('/interactions/:id', controller.updateInteraction);                 // PUT  /api/employers/interactions/:id
router.delete('/interactions/:id', controller.deleteInteraction);              // DELETE /api/employers/interactions/:id

// Legacy
router.post('/interact', controller.interact);                                 // POST /api/employers/interact

module.exports = router;
