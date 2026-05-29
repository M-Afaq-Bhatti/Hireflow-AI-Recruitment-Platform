const { Kafka } = require('kafkajs');

const kafka = new Kafka({
  clientId: 'hireflow-producer',
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

const producer = kafka.producer();
let connected = false;

const connectProducer = async () => {
  if (!connected) {
    await producer.connect();
    connected = true;
    console.log('📤 Kafka producer connected');
  }
};

const publish = async (topic, message) => {
  try {
    await connectProducer();
    await producer.send({
      topic,
      messages: [{ value: JSON.stringify(message) }],
    });
    console.log(`📤 Published to [${topic}]:`, message.candidateId || message);
  } catch (err) {
    console.error(`❌ Kafka publish error [${topic}]:`, err.message);
    // Non-fatal — pipeline continues without Kafka in dev mode
  }
};

module.exports = { publish, connectProducer };
