const express = require('express');
const router = express.Router();
const controller = require('../controllers/auth.controller');
const { authMiddleware } = require('../middleware/auth.middleware');
const {
  validate,
  signupRules,
  signinRules,
  signinPhoneRules,
  signinNIDRules,
} = require('../middleware/validation.middleware');

// Public auth routes
router.post('/signup', signupRules, validate, controller.signup);
router.post('/signin', signinRules, validate, controller.signin);
router.post('/signin-phone', signinPhoneRules, validate, controller.signinByPhone);       // FR 1.1
router.post('/signin-nid', signinNIDRules, validate, controller.signinByNationalId);      // FR 1.1

// Authenticated profile routes
router.get('/me', authMiddleware, controller.getMe);
router.put('/me', authMiddleware, controller.updateProfile);
router.put('/me/password', authMiddleware, controller.changePassword);

module.exports = router;
