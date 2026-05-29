const { Kafka } = require('kafkajs');
const TOPICS = require('./topics');
const agent1 = require('../agents/agent1.screener');
const agent2 = require('../agents/agent2.assessor');
const agent3 = require('../agents/agent3.evaluator');
const agent4 = require('../agents/agent4.interviewer');

const kafka = new Kafka({
  clientId: 'hireflow-consumer',
  brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
  connectionTimeout: 10000,
  requestTimeout: 30000,
  retry: {
    initialRetryTime: 100,
    retries: 5,
    maxRetryTime: 5000,
    multiplier: 2,
  }
});

const consumer = kafka.consumer({ 
  groupId: 'hireflow-agents',
  sessionTimeout: 30000,
  heartbeatInterval: 3000,
});

const initKafka = async () => {
  try {
    await consumer.connect();
  } catch (err) {
    console.error('Failed to connect Kafka consumer:', err.message);
    throw err;
  }

  try {
    await consumer.subscribe({ topics: [
    TOPICS.RESUME_SUBMITTED,
    TOPICS.SCREENING_PASSED,
    TOPICS.ASSESSMENT_SUBMITTED,
    TOPICS.INTERVIEW_INVITED,
  ], fromBeginning: false });

  await consumer.run({
    eachMessage: async ({ topic, message }) => {
      const data = JSON.parse(message.value.toString());
      console.log(`📥 Consumed [${topic}]:`, data.candidateId || data);

      try {
        switch (topic) {
          case TOPICS.RESUME_SUBMITTED:
            await agent1.run(data);
            break;
          case TOPICS.SCREENING_PASSED:
            await agent2.run(data);
            break;
          case TOPICS.ASSESSMENT_SUBMITTED:
            await agent3.run(data);
            break;
          case TOPICS.INTERVIEW_INVITED:
            await agent4.run(data);
            break;
        }
      } catch (err) {
        console.error(`❌ Agent error on topic [${topic}]:`, err.message);
      }
    },
  });
  } catch (err) {
    console.error('Failed to setup Kafka consumer subscriptions:', err.message);
    throw err;
  }
};

module.exports = { initKafka };
