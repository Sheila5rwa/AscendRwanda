const { body, validationResult } = require('express-validator');

// Utility: run validation and return errors if any
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  next();
};

// Signup validation (FR 1, FR 1.1, FR 1.2)
const signupRules = [
  body('first_name').trim().notEmpty().withMessage('First name is required'),
  body('last_name').trim().notEmpty().withMessage('Last name is required'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('role')
    .isIn(['student', 'mentor', 'admin', 'program_admin', 'employer'])
    .withMessage('Invalid role'),
  body('email')
    .optional({ nullable: true, checkFalsy: true })
    .isEmail()
    .withMessage('Invalid email format'),
  body('phone_number')
    .optional({ nullable: true, checkFalsy: true })
    .matches(/^\+?[0-9]{7,15}$/)
    .withMessage('Invalid phone number'),
  body('dob')
    .optional({ nullable: true, checkFalsy: true })
    .isDate()
    .withMessage('Invalid date of birth'),
];

// Signin validation
const signinRules = [
  body('email').notEmpty().withMessage('Email is required').isEmail().withMessage('Invalid email'),
  body('password').notEmpty().withMessage('Password is required'),
];

// Phone signin
const signinPhoneRules = [
  body('phone_number').notEmpty().withMessage('Phone number is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

// National ID signin
const signinNIDRules = [
  body('national_id').notEmpty().withMessage('National ID is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

// Module creation
const moduleRules = [
  body('title').trim().notEmpty().withMessage('Module title is required'),
  body('duration_minutes')
    .isInt({ min: 1 })
    .withMessage('Duration must be a positive integer'),
  body('language')
    .isIn(['Kinyarwanda', 'English'])
    .withMessage('Language must be Kinyarwanda or English'),
];

// Content creation
const contentRules = [
  body('module_id').isInt().withMessage('module_id must be an integer'),
  body('title').trim().notEmpty().withMessage('Content title is required'),
  body('content_type')
    .isIn(['note', 'quiz', 'exam'])
    .withMessage('content_type must be note, quiz, or exam'),
];

// Question creation
const questionRules = [
  body('content_id').isInt().withMessage('content_id must be an integer'),
  body('question_text').trim().notEmpty().withMessage('Question text is required'),
  body('question_type')
    .isIn(['MCQ', 'TF', 'Short Answer'])
    .withMessage('question_type must be MCQ, TF, or Short Answer'),
  body('marks').optional().isInt({ min: 1 }).withMessage('Marks must be a positive integer'),
];

// Employer interaction
const interactionRules = [
  body('student_id').isInt().withMessage('student_id must be an integer'),
  body('content').optional().trim(),
];

// Mentor note
const mentorNoteRules = [
  body('student_id').isInt().withMessage('student_id must be an integer'),
  body('notes').trim().notEmpty().withMessage('Notes are required'),
];

module.exports = {
  validate,
  signupRules,
  signinRules,
  signinPhoneRules,
  signinNIDRules,
  moduleRules,
  contentRules,
  questionRules,
  interactionRules,
  mentorNoteRules,
};
