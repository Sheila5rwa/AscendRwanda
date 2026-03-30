const express = require('express');
const router = express.Router();
const controller = require('../controllers/mentor.controller');
const { authMiddleware, isMentor } = require('../middleware/auth.middleware');
const { validate, mentorNoteRules } = require('../middleware/validation.middleware');

router.use(authMiddleware, isMentor);

// FR 4: Assigned student management
router.get('/students', controller.getMyStudents);                             // GET  /api/mentors/students
router.get('/students/:student_id/progress', controller.getStudentProgressForMentor); // GET  /api/mentors/students/:id/progress

// FR 4: Flagging
router.get('/flagged', controller.getFlaggedStudents);                         // GET  /api/mentors/flagged
router.put('/flag/:student_id', controller.flagStudent);                       // PUT  /api/mentors/flag/:student_id
router.put('/unflag/:student_id', controller.unflagStudent);                   // PUT  /api/mentors/unflag/:student_id

// FR 4: Mentorship records
router.get('/assignments/:id', controller.getMentorshipById);                  // GET  /api/mentors/assignments/:id
router.delete('/assignments/:id', controller.removeMentorship);               // DELETE /api/mentors/assignments/:id

// FR 4: Messaging
router.post('/note', [...mentorNoteRules, validate], controller.addMentorNote); // POST /api/mentors/note (Private)
router.post('/message', controller.sendStudentMessage);                        // POST /api/mentors/message (Public to Student)

// Legacy admin-triggered assign (admin route preferred)
router.post('/assign', controller.assignMentor);                               // POST /api/mentors/assign

module.exports = router;
