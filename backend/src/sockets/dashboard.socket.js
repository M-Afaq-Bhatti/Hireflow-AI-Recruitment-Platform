const { getIO } = require('./socket.server');

const emitCandidateUpdate = (tenantId, data) => {
  const io = getIO();
  if (!io) return;
  io.to(`tenant:${tenantId}`).emit('candidate:updated', data);
  console.log(`📡 Emitted candidate:updated to tenant ${tenantId}`, data);
};

const emitNewCandidate = (tenantId, data) => {
  const io = getIO();
  if (!io) return;
  io.to(`tenant:${tenantId}`).emit('candidate:new', data);
};

module.exports = { emitCandidateUpdate, emitNewCandidate };
