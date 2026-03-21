import dotenv from 'dotenv';

dotenv.config();

export const ENV = {
  SUPABASE_URL: process.env.URL_SUPABASE,
  SUPABASE_KEY: process.env.PK_SUPABASE
};