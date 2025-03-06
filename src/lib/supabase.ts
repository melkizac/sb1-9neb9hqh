import { createClient } from '@supabase/supabase-js';
import { type AuthError } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Improved error handling
const handleSupabaseError = (error: Error | AuthError) => {
  // Only log auth errors if they're not related to missing refresh token
  if (
    error.name !== 'AuthApiError' || 
    (error as AuthError).message !== 'Invalid Refresh Token: Refresh Token Not Found'
  ) {
    console.error('Supabase operation failed:', error);
  }
  throw error;
};

const retryOperation = async (operation: () => Promise<any>, maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      // Don't retry auth errors
      if (error.name === 'AuthApiError') {
        throw error;
      }
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
    }
  }
};

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Initialize storage with fallback
const customStorage = {
  getItem: (key: string): string | null => {
    try {
      const item = localStorage.getItem(key);
      if (!item) return null;
      // Validate JSON structure
      JSON.parse(item);
      return item;
    } catch (error) {
      console.warn('Storage error, clearing invalid data:', error);
      localStorage.removeItem(key);
      return null;
    }
  },
  setItem: (key: string, value: string): void => {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.error('Error setting storage:', error);
    }
  },
  removeItem: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from storage:', error);
    }
  }
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: false, // Don't persist session to avoid stale token issues
    detectSessionInUrl: true,
    storage: customStorage,
    storageKey: 'supabase-auth-token',
    flowType: 'pkce'
  },
  global: {
    fetch: (...args) => {
      return retryOperation(() => fetch(...args))
        .catch((error) => {
          handleSupabaseError(error);
          throw error; // Re-throw to maintain error chain
        });
    }
  }
});