import crypto from "node:crypto";
import buffer from "node:buffer"

/* SETUP .env FILE */
import { config } from "dotenv";
config();

const encryptionAlgorithm = (key) => {
  const ALGO = 'aes-256-gcm';
  
  const encrypt = (plaintext) => {
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv(ALGO, key, iv);
    
    let enc = cipher.update(plaintext, 'utf8', 'base64');
    enc += cipher.final('base64');
    return `${enc}:${iv.toString("hex")}:${cipher.getAuthTag().toString("hex")}`
  };
  
  const decrypt = (encryptedArray) => {

    const [enc, ivHex, authTagHex] = encryptedArray.split(":");
    const iv = Buffer.from(ivHex, "hex");
    const authTag = Buffer.from(authTagHex, "hex")

    const decipher = crypto.createDecipheriv(ALGO, key, iv);
    decipher.setAuthTag(authTag);
    let str = decipher.update(enc, 'base64', 'utf8');
    str += decipher.final('utf8');
    return str;
  }
  
  const hash = (plaintext) => {
    return crypto.createHmac('sha256', process.env.EMAIL_HASH_KEY).update(plaintext).digest("hex")
  }
  
  const getToken = () => {
    return crypto.randomBytes(32);
  }
  
  return {
    encrypt,
    decrypt,
    hash,
    getToken,
  };
};

const KEY = process.env.EMAIL_ENCRYPTION_KEY
export const aesCipher = encryptionAlgorithm(KEY);

