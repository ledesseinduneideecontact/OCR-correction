import { config } from 'dotenv';

config();

export default {
  port: process.env.PORT || 3000,
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
  },
  supabase: {
    url: process.env.VITE_SUPABASE_URL,
    anonKey: process.env.VITE_SUPABASE_ANON_KEY,
  },
  mistral: {
    apiKey: process.env.MISTRAL_API_KEY,
  },
  uploadLimits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 10,
  },
};