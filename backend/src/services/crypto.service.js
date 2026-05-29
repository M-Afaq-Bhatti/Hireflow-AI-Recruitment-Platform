const crypto = require('crypto');
const fs = require('fs');

const KEY = Buffer.from(process.env.ENCRYPTION_KEY || '12345678901234567890123456789012', 'utf8').slice(0, 32);
const ALGORITHM = 'aes-256-cbc';

const encryptFile = (inputPath) => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
  const input = fs.readFileSync(inputPath);
  const encrypted = Buffer.concat([cipher.update(input), cipher.final()]);
  const result = Buffer.concat([iv, encrypted]);
  fs.writeFileSync(inputPath, result);
};

const decryptFile = (filePath) => {
  const data = fs.readFileSync(filePath);
  const iv = data.slice(0, 16);
  const encryptedData = data.slice(16);
  const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
  return Buffer.concat([decipher.update(encryptedData), decipher.final()]);
};

module.exports = { encryptFile, decryptFile };
