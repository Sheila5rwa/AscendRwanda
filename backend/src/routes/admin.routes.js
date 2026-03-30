const express = require('express');
const router = express.Router();
const controller = require('../controllers/admin.controller');
const { authMiddleware, isAdmin } = require('../middleware/auth.middleware');

// All admin routes require auth + admin role
router.use(authMiddleware, isAdmin);

// User management (FR 1 admin view)
router.get('/users', controller.getAllUsers);                          // GET /api/admin/users?role=student
router.get('/users/:id', controller.getUserById);                     // GET /api/admin/users/:id
router.put('/users/:id', controller.updateUser);                      // PUT /api/admin/users/:id
router.delete('/users/:id', controller.deleteUser);                   // DELETE /api/admin/users/:id
router.put('/users/:id/reset-password', controller.resetUserPassword); // PUT /api/admin/users/:id/reset-password

// Mentorship assignment (FR 4)
router.post('/assign-mentor', controller.assignMentorToStudent);      // POST /api/admin/assign-mentor

// Dashboard statistics
router.get('/stats', controller.getDashboardStats);                   // GET /api/admin/stats

// All student progress (FR 5.1 admin view)
router.get('/progress', controller.getAllStudentProgress);            // GET /api/admin/progress
router.get('/certificates', controller.getAllCertificates);        // GET /api/admin/certificates

module.exports = router;
