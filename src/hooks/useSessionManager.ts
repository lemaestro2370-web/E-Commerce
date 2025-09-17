import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useStore } from '../store/useStore';
import { User as AppUser } from '../types'; // import your User type

interface SessionManager {
  isSessionValid: boolean;
  isLoading: boolean;
  refreshSession: () => Promise<boolean>;
  checkSession: () => Promise<boolean>;
  getCurrentUser: () => any;
}

const fetchUserWithAdmin = async (supabaseUser: any): Promise<AppUser | null> => {
  if (!supabaseUser) return null;
  // Fetch profile from your 'profiles' table (adjust table/column names as needed)
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', supabaseUser.id)
    .single();
  if (error) {
    console.error('Failed to fetch user profile:', error);
    return null;
  }
  return {
    ...supabaseUser,
    is_admin: profile?.is_admin ?? false,
  } as AppUser;
};

export const useSessionManager = (): SessionManager => {
  const { user, setUser } = useStore();
  const [isSessionValid, setIsSessionValid] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const checkSession = useCallback(async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Get current session
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Session check error:', error);
        setIsSessionValid(false);
        return false;
      }

      if (!session || !session.user) {
        setIsSessionValid(false);
        return false;
      }

      // Update user if needed
      if (!user || user.id !== session.user.id) {
        const userWithAdmin = await fetchUserWithAdmin(session.user);
        setUser(userWithAdmin);
      }

      setIsSessionValid(true);
      return true;
    } catch (error) {
      console.error('Session check failed:', error);
      setIsSessionValid(false);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user, setUser]);

  const refreshSession = useCallback(async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Attempt to refresh the session
      const { data: { session }, error } = await supabase.auth.refreshSession();
      
      if (error) {
        console.error('Session refresh error:', error);
        setIsSessionValid(false);
        setUser(null);
        return false;
      }

      if (!session || !session.user) {
        setIsSessionValid(false);
        setUser(null);
        return false;
      }

      // Update user data
      const userWithAdmin = await fetchUserWithAdmin(session.user);
      setUser(userWithAdmin);
      setIsSessionValid(true);
      
      console.log('Session refreshed successfully');
      return true;
    } catch (error) {
      console.error('Session refresh failed:', error);
      setIsSessionValid(false);
      setUser(null);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [setUser]);

  const getCurrentUser = useCallback(() => {
    return user;
  }, [user]);

  // Check session on mount and when user changes
  useEffect(() => {
    checkSession();
  }, [checkSession]);

  // Set up periodic session check (every 5 minutes)
  useEffect(() => {
    const interval = setInterval(() => {
      checkSession();
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [checkSession]);

  return {
    isSessionValid,
    isLoading,
    refreshSession,
    checkSession,
    getCurrentUser
  };
};
