const jwt = require('jsonwebtoken');
const db = require('../models');
const User = db.User;

// ─── Verify JWT and attach user info to request ───────────────────────────────
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(403).json({ message: 'No token provided. Access denied.' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Token is invalid or expired.' });
    }
    req.userId   = decoded.id;
    req.userRole = decoded.role;
    next();
  });
};

// ─── Role Guards ──────────────────────────────────────────────────────────────
const isAdmin = (req, res, next) => {
  if (['admin', 'program_admin'].includes(req.userRole)) return next();
  return res.status(403).json({ message: 'Access denied: Admin role required.' });
};

const isAdminOrMentor = (req, res, next) => {
  if (['admin', 'program_admin', 'mentor'].includes(req.userRole)) return next();
  return res.status(403).json({ message: 'Access denied: Admin or Mentor role required.' });
};

const isMentor = (req, res, next) => {
  if (['mentor', 'admin', 'program_admin'].includes(req.userRole)) return next();
  return res.status(403).json({ message: 'Access denied: Mentor role required.' });
};

const isEmployer = (req, res, next) => {
  if (['employer', 'admin', 'program_admin'].includes(req.userRole)) return next();
  return res.status(403).json({ message: 'Access denied: Employer role required.' });
};

const isStudent = (req, res, next) => {
  if (['student', 'admin', 'program_admin'].includes(req.userRole)) return next();
  return res.status(403).json({ message: 'Access denied: Student role required.' });
};

// ─── Ownership guard: ensure a student can only access their own data ───────
const isSelfOrAdmin = (paramKey = 'id') => (req, res, next) => {
  const targetId = parseInt(req.params[paramKey]);
  if (req.userRole === 'admin' || req.userRole === 'program_admin') return next();
  if (req.userId === targetId) return next();
  return res.status(403).json({ message: 'Access denied: You can only access your own data.' });
};

module.exports = {
  authMiddleware,
  isAdmin,
  isAdminOrMentor,
  isMentor,
  isEmployer,
  isStudent,
  isSelfOrAdmin,
};
