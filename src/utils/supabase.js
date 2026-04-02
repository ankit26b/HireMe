import { createClient } from '@supabase/supabase-js';

export const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Basic Supabase client for non-authenticated requests
export const supabase = createClient(supabaseUrl, supabaseKey);

// Cache for authenticated Supabase clients to avoid "Multiple GoTrueClient" warnings
let cachedClient = null;
let cachedToken = null;

// Function that creates a Supabase client with Clerk token
const supabaseClient = async (supabaseAccessToken) => {
  if (cachedClient && cachedToken === supabaseAccessToken) {
    return cachedClient;
  }

  cachedToken = supabaseAccessToken;
  cachedClient = createClient(supabaseUrl, supabaseKey, {
    global: {
      headers: {
        Authorization: `Bearer ${supabaseAccessToken}`,
      },
    },
  });

  return cachedClient;
};

export default supabaseClient;
