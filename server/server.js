const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

// Polyfill global crypto for older Node.js versions (like Node 18) used in production
if (!global.crypto) {
  global.crypto = require('crypto');
}

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const { register, httpMetricsMiddleware } = require('./utils/metrics');

// Load env variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Request logger middleware
app.use((req, res, next) => {
  console.log(`[REQUEST] ${req.method} ${req.url} - Origin: ${req.headers.origin || 'none'}`);
  next();
});

// Security middleware
app.use(helmet());

// Dynamic CORS configuration to automatically allow local dev, CLIENT_URL, and any Vercel/Render deployment
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, or server-to-server)
    if (!origin) return callback(null, true);
    
    const isAllowed = allowedOrigins.includes(origin) || 
                      origin.endsWith('.vercel.app') || 
                      origin.endsWith('.onrender.com') ||
                      /^http:\/\/localhost:\d+$/.test(origin);
                      
    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  message: {
    success: false,
    message: 'Too many requests, please try again later.',
  },
});
app.use('/api/', limiter);

// Code execution has stricter rate limits
const codeLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 15, // 15 executions per minute
  message: {
    success: false,
    message: 'Too many code executions. Please wait a moment.',
  },
});

// Body parsing
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));

// Prometheus metrics endpoint (before rate-limiter so scraping is never throttled)
app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (err) {
    res.status(500).end(err.message);
  }
});

// HTTP request duration middleware (track all API requests)
app.use(httpMetricsMiddleware);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'CompileHub API is running! 🚀',
    timestamp: new Date().toISOString(),
  });
});

// Routes
const { run } = require('./controllers/runController');
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/snippets', require('./routes/snippetRoutes'));
app.use('/api/code', codeLimiter, require('./routes/codeRoutes'));
app.post('/api/run', codeLimiter, run);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found.`,
  });
});

// Global error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`\n⚡ CompileHub Server running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}\n`);
});
