const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { sequelize } = require('./src/models');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// ─── NFR 1: Security Headers ──────────────────────────────────────────────────
app.use(helmet());

// ─── NFR 1: CORS (restrict to known origins) ─────────────────────────────────
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173,http://localhost:3000')
  .split(',')
  .map(origin => origin.trim().replace(/\/$/, '')) // Strip trailing slashes
  .filter(origin => origin.length > 0);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (curl, mobile apps, same-origin)
    // Also allow if '*' is in allowed origins
    if (!origin || allowedOrigins.includes('*')) return callback(null, true);
    
    // Normalize incoming origin to strip trailing slash for matching
    const normalizedOrigin = origin.replace(/\/$/, '');
    if (allowedOrigins.includes(normalizedOrigin)) return callback(null, true);
    
    console.warn(`[CORS] Request from origin ${origin} rejected. Allowed: ${allowedOrigins.join(', ')}`);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

// ─── NFR 2: Rate Limiting (support 120+ concurrent users) ────────────────────
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 200,            // 200 requests per IP per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests, please try again after a minute.' },
});
app.use('/api/', limiter);

// Stricter limit on auth endpoints to prevent brute-force (NFR 1)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30,
  message: { message: 'Too many login attempts, please try again after 15 minutes.' },
});
app.use('/api/auth/signin', authLimiter);
app.use('/api/auth/signin-phone', authLimiter);
app.use('/api/auth/signin-nid', authLimiter);

app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Import routes ────────────────────────────────────────────────────────────
const authRoutes = require('./src/routes/auth.routes');
const adminRoutes = require('./src/routes/admin.routes');
const moduleRoutes = require('./src/routes/module.routes');
const studentRoutes = require('./src/routes/student.routes');
const mentorRoutes = require('./src/routes/mentor.routes');
const employerRoutes = require('./src/routes/employer.routes');
const certController = require('./src/controllers/certificate.controller');

// ─── Register routes ──────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);          // FR 1, FR 1.1, FR 1.2
app.use('/api/admin', adminRoutes);        // Admin: user mgmt, stats, mentor assign
app.use('/api/modules', moduleRoutes);     // FR 2, FR 5
app.use('/api/students', studentRoutes);   // FR 2, FR 3, FR 5.1
app.use('/api/mentors', mentorRoutes);     // FR 4
app.use('/api/employers', employerRoutes); // FR 6, FR 6.1–6.4

// ─── FR 3.2: Public certificate verification (no auth required) ───────────────
app.get('/api/verify/:token', certController.verifyCertificate);

// ─── NFR 4: Health check endpoint ────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// ─── Root ─────────────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    name: 'Ascend Rwanda API',
    version: '1.0.0',
    description: 'Integrated E-Learning & Employer Interaction Platform',
    health: '/api/health',
    docs: 'See README for endpoint reference',
  });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({ message: err.message });
  }
  console.error('[Error]', err.stack || err.message);
  res.status(500).json({ message: 'Internal server error.' });
});

// ─── Database sync + Server start ────────────────────────────────────────────
sequelize.sync({ alter: true })
  .then(() => {
    console.log('[DB] Database synced successfully.');
    const server = app.listen(PORT, () => {
      console.log(`[Server] Ascend Rwanda API running on http://localhost:${PORT}`);
    });

    // ─── NFR 4: Graceful shutdown ─────────────────────────────────────────────
    const shutdown = (signal) => {
      console.log(`[Server] ${signal} received — shutting down gracefully...`);
      server.close(() => {
        sequelize.close().then(() => {
          console.log('[Server] Closed. Goodbye.');
          process.exit(0);
        });
      });
    };
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  })
  .catch(err => {
    console.error('[DB] Error syncing database:', err);
    process.exit(1);
  });
