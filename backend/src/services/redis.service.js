const Redis = require('ioredis');

let redis;

const getRedis = () => {
  if (!redis) {
    redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
      lazyConnect: true,
      retryStrategy: (times) => {
        if (times > 3) return null; // Stop retrying
        return Math.min(times * 100, 3000);
      },
    });
    redis.on('error', (err) => {
      if (err.code !== 'ECONNREFUSED') console.error('Redis error:', err.message);
    });
  }
  return redis;
};

const setStage = async (tenantId, candidateId, stage) => {
  try {
    await getRedis().set(`tenant:${tenantId}:candidate:${candidateId}:stage`, stage, 'EX', 86400 * 30);
  } catch (e) { /* Redis unavailable - non-fatal */ }
};

const getStage = async (tenantId, candidateId) => {
  try {
    return await getRedis().get(`tenant:${tenantId}:candidate:${candidateId}:stage`);
  } catch (e) { return null; }
};

const setInterviewToken = async (token, candidateId, ttlSeconds = 3600) => {
  try {
    await getRedis().set(`interview:token:${token}`, candidateId, 'EX', ttlSeconds);
  } catch (e) { /* non-fatal */ }
};

const getInterviewCandidate = async (token) => {
  try {
    return await getRedis().get(`interview:token:${token}`);
  } catch (e) { return null; }
};

const setJobConfig = async (tenantId, jobId, config) => {
  try {
    await getRedis().set(`tenant:${tenantId}:job:${jobId}`, JSON.stringify(config), 'EX', 3600);
  } catch (e) { /* non-fatal */ }
};

const getJobConfig = async (tenantId, jobId) => {
  try {
    const val = await getRedis().get(`tenant:${tenantId}:job:${jobId}`);
    return val ? JSON.parse(val) : null;
  } catch (e) { return null; }
};

module.exports = { setStage, getStage, setInterviewToken, getInterviewCandidate, setJobConfig, getJobConfig };
