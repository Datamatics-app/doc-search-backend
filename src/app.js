// app.js
require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');

const logger = require('./config/logger');
const { notFound, errorHandler } = require('./middleware/errorHandler');
const { createOpenApiSpec } = require('./swagger');

// Route modules
const authRoutes          = require('./modules/auth/auth.routes');
const usersRoutes         = require('./modules/users/users.routes');
const rolesRoutes         = require('./modules/roles/roles.routes');
const auditRoutes         = require('./modules/audit/audit.routes');
const documentRoutes      = require('./modules/documents/document.routes');
const eoafRoutes          = require('./modules/eoaf/eoaf.routes');
const eoafLdRoutes        = require('./modules/eoaf-ld/eoaf-ld.routes');
const eoafScrapcadRoutes  = require('./modules/eoaf-scrapcad/eoaf-scrapcad.routes');
const eoafGeneralRoutes   = require('./modules/eoaf-general/eoaf-general.routes');

const app = express();

// ── Security middleware ──────────────────────────────────────
app.use(helmet());

const ALLOWED_ORIGINS = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim())
  : [];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin
    if (!origin) return callback(null, true);
    if (ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
    callback(new Error(`CORS: origin '${origin}' not allowed`));
  },
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ── Rate limiting ────────────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { success: false, message: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Too many login attempts, please try again later.' },
});

const apiLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 60 });

app.use(globalLimiter);

// ── Request parsing ──────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// ── HTTP request logging ─────────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined', {
    stream: { write: (msg) => logger.http(msg.trim()) },
  }));
}

// ── Health check ─────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Doc Search API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// ── API Routes ───────────────────────────────────────────────
app.use('/api/v1/auth',           authLimiter, authRoutes);
app.use('/api/v1/users',          apiLimiter,  usersRoutes);
app.use('/api/v1/roles',          apiLimiter,  rolesRoutes);
app.use('/api/v1/audit-logs',     apiLimiter,  auditRoutes);
app.use('/api/v1/documents',      apiLimiter,  documentRoutes);
app.use('/api/v1/eoaf',           apiLimiter,  eoafRoutes);
app.use('/api/v1/eoaf/ld',        apiLimiter,  eoafLdRoutes);
app.use('/api/v1/eoaf/scrapcad',  apiLimiter,  eoafScrapcadRoutes);
app.use('/api/v1/eoaf/general',   apiLimiter,  eoafGeneralRoutes);

const openApiSpec = createOpenApiSpec(app);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openApiSpec));
app.get('/api-docs.json', (req, res) => res.json(openApiSpec));

// ── 404 & Error handlers ─────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

module.exports = app;