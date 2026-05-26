const client = require('prom-client');

// ─── Registry & Defaults ───────────────────────────────────────────
const register = client.register;

// Collect default Node.js/process metrics (CPU, memory, event loop lag, GC, etc.)
client.collectDefaultMetrics({ register });

// ─── Custom Application Metrics ────────────────────────────────────

/**
 * Total code executions – Counter
 * Labels: language (javascript, python, …), status (success | failure)
 * Dashboard panels: Throughput, Success Rate, Language Share, Failures by Language
 */
const codeExecutionsTotal = new client.Counter({
  name: 'compilehub_code_executions_total',
  help: 'Total number of code executions',
  labelNames: ['language', 'status'],
  registers: [register],
});

/**
 * Code execution duration – Histogram
 * Labels: language
 * Dashboard panel: Average Execution Duration
 */
const codeExecutionDuration = new client.Histogram({
  name: 'compilehub_code_execution_duration_seconds',
  help: 'Duration of code executions in seconds',
  labelNames: ['language'],
  buckets: [0.1, 0.25, 0.5, 1, 2, 5, 10], // 100ms → 10s
  registers: [register],
});

/**
 * HTTP request duration – Histogram
 * Labels: method, route, status_code
 * General API observability (not currently on dashboard but useful)
 */
const httpRequestDuration = new client.Histogram({
  name: 'compilehub_http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.01, 0.05, 0.1, 0.3, 0.5, 1, 2, 5],
  registers: [register],
});

// ─── Helper Functions ──────────────────────────────────────────────

/**
 * Record a completed code execution.
 * @param {string} language  – e.g. "javascript", "python"
 * @param {boolean} success  – whether execution succeeded
 * @param {number} durationSec – wall-clock duration in seconds
 */
const recordExecution = (language, success, durationSec) => {
  const lang = language.toLowerCase();
  const status = success ? 'success' : 'failure';
  codeExecutionsTotal.labels(lang, status).inc();
  codeExecutionDuration.labels(lang).observe(durationSec);
};

/**
 * Express middleware that records HTTP request duration for every request.
 * Attach BEFORE your routes.
 */
const httpMetricsMiddleware = (req, res, next) => {
  const end = httpRequestDuration.startTimer();
  res.on('finish', () => {
    // Normalise route to avoid high-cardinality label explosion
    const route = req.route ? req.route.path : req.path;
    end({ method: req.method, route, status_code: res.statusCode });
  });
  next();
};

module.exports = {
  register,
  recordExecution,
  httpMetricsMiddleware,
};
