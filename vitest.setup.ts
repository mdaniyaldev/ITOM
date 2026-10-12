import '@testing-library/jest-dom';

// Load environment variables from .env file
import { config } from 'dotenv';
config();

// If dotenv doesn't work in vitest, we can set them directly
if (typeof process !== 'undefined' && process.env) {
  // Default values if not set
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://127.0.0.1:54321';
  }
  if (!process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH';
  }
}