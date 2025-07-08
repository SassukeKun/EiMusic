/**
 * Supabase OAuth utilities
 * This file provides a simplified and reliable approach to Supabase OAuth
 */

import { getSupabaseBrowserClient } from './supabaseClient';

// Constants for PKCE debugging
export const SUPABASE_PROJECT_REF = "rayacnytyvuytjmlklot"; // From your project URL
export const PKCE_STORAGE_KEY = `sb-${SUPABASE_PROJECT_REF}-auth-session-code-verifier`;

/**
 * Generate a random string for PKCE verification
 * Using the same technique Supabase would internally use
 */
function generateRandomString(length: number): string {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  let result = '';
  const randomValues = new Uint8Array(length);
  window.crypto.getRandomValues(randomValues);
  for (let i = 0; i < length; i++) {
    result += charset[randomValues[i] % charset.length];
  }
  return result;
}

/**
 * Create a SHA-256 hash from a string
 */
async function sha256(str: string): Promise<ArrayBuffer> {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  return window.crypto.subtle.digest('SHA-256', data);
}

/**
 * Convert an array buffer to a URL-safe base64 string
 */
function bufferToBase64UrlSafe(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let base64 = btoa(String.fromCharCode(...bytes));
  
  // Make it URL safe
  return base64
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

/**
 * Initiate an OAuth sign-in flow with Google
 * This function follows Supabase best practices for OAuth PKCE flow
 * @param provider The OAuth provider to use ('google', 'facebook', etc.)
 * @param userType 'user' or 'artist'
 */
export async function initiateOAuthSignIn(provider: 'google' | 'facebook' | 'twitter', userType: 'user' | 'artist') {
  if (typeof window === 'undefined') {
    throw new Error('OAuth sign-in can only be initiated in the browser');
  }

  // Store the user type in localStorage (not sessionStorage) to ensure it persists through redirects
  // Using localStorage was part of a previous successful fix
  localStorage.setItem('em_oauth_user_type', userType);
  console.log(`Stored user type '${userType}' in localStorage for OAuth flow`);
  
  console.log(`Initiating ${provider} OAuth sign-in for ${userType}...`);
  
  // First, aggressively clear any storage that might interfere
  console.log('Clearing storage before OAuth initiation...');
  // Clear all localStorage items that start with 'sb-'
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith('sb-')) {
      console.log(`Removing localStorage item: ${key}`);
      localStorage.removeItem(key);
    }
  });
  
  // Clear all sessionStorage items that start with 'sb-'
  Object.keys(sessionStorage).forEach(key => {
    if (key.startsWith('sb-')) {
      console.log(`Removing sessionStorage item: ${key}`);
      sessionStorage.removeItem(key);
    }
  });
  
  // Get a fresh Supabase client
  const supabase = getSupabaseBrowserClient();
  
  // Generate the callback URL
  const origin = window.location.origin;
  const callbackUrl = `${origin}/auth/callback`;
  
  try {
    // Sign out first to clear any existing session state
    await supabase.auth.signOut();
    
    // Call the OAuth sign-in method
    // This will set up the PKCE flow and redirect to the provider
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: callbackUrl,
        // Skip adding extra parameters that could interfere
      }
    });
    
    if (error) {
      console.log('Error initiating OAuth flow:', error);
      return { success: false, error };
    }
    
    if (!data?.url) {
      console.log('No redirect URL returned from signInWithOAuth');
      return { success: false, error: new Error('No redirect URL') };
    }
    
    // Log PKCE state for debugging
    console.log(`PKCE verifier set? ${!!sessionStorage.getItem(PKCE_STORAGE_KEY)}`);
    
    // If verifier wasn't set by Supabase, let's try forcing a redirect
    if (!sessionStorage.getItem(PKCE_STORAGE_KEY)) {
      console.log('PKCE verifier not set - falling back to direct redirect');
      
      // Use setTimeout to allow for console logging before redirect
      setTimeout(() => {
        console.log('Redirecting to authorization URL:', data.url);
        window.location.href = data.url;
      }, 100);
    } else {
      console.log('PKCE verifier set, redirecting to provider authorization URL...');
      // Use setTimeout to allow for console logging before redirect
      setTimeout(() => {
        window.location.href = data.url;
      }, 100);
    }
    
    // Return a success status (this won't actually be used due to the redirect)
    return { success: true };
  } catch (error) {
    console.log('Exception in OAuth flow initiation:', error);
    return { success: false, error };
  }
}

/**
 * Handle the OAuth callback from the provider
 * @param code The authorization code from the provider
 */
export async function handleOAuthCallback(code: string) {
  if (typeof window === 'undefined') {
    throw new Error('OAuth callback can only be handled in the browser');
  }

  // Get the user type from localStorage (not sessionStorage) as per previous successful implementation
  const userType = localStorage.getItem('em_oauth_user_type') || 'user';
  console.log(`Handling OAuth callback for ${userType} with code length: ${code.length}`);
  
  // Log the PKCE state for debugging
  const hasVerifier = !!sessionStorage.getItem(PKCE_STORAGE_KEY);
  console.log(`PKCE verifier present: ${hasVerifier}`);
  
  // Log all sessionStorage and localStorage for debugging
  console.log('All sessionStorage items:', Object.keys(sessionStorage));
  console.log('All localStorage items:', Object.keys(localStorage));
  
  // Get a fresh Supabase client
  const supabase = getSupabaseBrowserClient();
  
  try {
    // Exchange the code for a session
    // Supabase will use the code_verifier from sessionStorage automatically
    console.log('Exchanging code for session...');
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (error) {
      console.log('Error exchanging code for session:', error);
      
      // Check specifically for PKCE error
      if (error.message?.includes('code verifier') || error.message?.includes('PKCE')) {
        console.log('PKCE verification failed - code_verifier missing or invalid');
        // We could implement recovery logic here if needed
      }
      
      return { success: false, error, userType };
    }
    
    if (!data?.session) {
      console.log('No session returned from exchangeCodeForSession');
      return { success: false, error: new Error('No session data'), userType };
    }
    
    console.log('Successfully exchanged code for session');
    
    // Clear our custom storage item from localStorage
    localStorage.removeItem('em_oauth_user_type');
    
    return { success: true, session: data.session, user: data.user, userType };
  } catch (error) {
    console.log('Exception in OAuth callback handling:', error);
    return { success: false, error, userType };
  }
}
