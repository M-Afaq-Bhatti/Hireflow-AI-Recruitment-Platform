const jwt = require('jsonwebtoken');

const SECRET = process.env.JWT_SECRET || 'changeme';

const signToken = (payload, expiresIn = process.env.JWT_EXPIRES_IN || '7d') => {
  return jwt.sign(payload, SECRET, { expiresIn });
};

const verifyToken = (token) => {
  return jwt.verify(token, SECRET);
};

const signInterviewToken = (candidateId, jobId) => {
  return jwt.sign({ candidateId, jobId, type: 'interview' }, SECRET, { expiresIn: '24h' });
};

module.exports = { signToken, verifyToken, signInterviewToken };
