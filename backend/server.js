require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const path = require('path');
const rateLimit = require('express-rate-limit');

const { initSocket } = require('./src/sockets/socket.server');
const { initKafka } = require('./src/kafka/consumer');

// Routes
const authRoutes = require('./src/routes/auth.routes');
const jobRoutes = require('./src/routes/job.routes');
const candidateRoutes = require('./src/routes/candidate.routes');
const assessmentRoutes = require('./src/routes/assessment.routes');
const interviewRoutes = require('./src/routes/interview.routes');
const tenantRoutes = require('./src/routes/tenant.routes');

const app = express();
const server = http.createServer(app);

// Init Socket.io
initSocket(server);

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests, please try again later.' }
});
app.use('/api/', limiter);

// Static uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tenants', tenantRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/candidates', candidateRoutes);
app.use('/api/assessments', assessmentRoutes);
app.use('/api/interviews', interviewRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, async () => {
  console.log(`\n🚀 HireFlow backend running on http://localhost:${PORT}`);
  console.log(`📡 Socket.io ready`);
  
  // Init Kafka consumers (non-blocking)
  try {
    await initKafka();
    console.log(`📨 Kafka consumers connected`);
  } catch (err) {
    console.warn(`⚠️  Kafka not available - agents will be disabled. Start Docker to enable.`);
    console.warn(`   Run: docker-compose up -d`);
  }
});

module.exports = { app, server };
