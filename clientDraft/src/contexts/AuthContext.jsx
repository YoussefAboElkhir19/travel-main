import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useSupabase } from '@/contexts/SupabaseContext';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const { supabase, loading: supabaseLoading } = useSupabase();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = useCallback(async (authUser) => {
    if (!supabase || !authUser) {
      setUser(null);
      return null;
    }
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*, roles(*)')
        .eq('id', authUser.id)
        .single();
        
      if (error && error.code !== 'PGRST116') {
          console.error("Error fetching user profile:", error.message);
          setUser(null);
          return null;
      }
      
      const userProfile = {
          ...data,
          id: authUser.id,
          email: authUser.email,
          username: data?.username || authUser.email.split('@')[0],
          role: data?.roles?.name || 'employee',
          permissions: data?.roles?.permissions || [],
          canAddItems: data?.roles?.can_add_items || false,
          default_route: data?.roles?.default_route || '/attendance',
      };
      
      setUser(userProfile);
      return userProfile;

    } catch (error) {
      console.error("Critical error in fetchUserProfile:", error.message);
      setUser(null);
      return null;
    }
  }, [supabase]);
  
  useEffect(() => {
    if (supabaseLoading) {
      setLoading(true);
      return;
    }
    if (!supabase) {
      setLoading(false);
      return;
    }
    
    let isMounted = true;

    const getSession = async () => {
      setLoading(true);
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        if (isMounted && session?.user) {
          await fetchUserProfile(session.user);
        }
      } catch(error) {
          console.error("Error getting session:", error.message);
      } finally {
        if(isMounted) setLoading(false);
      }
    };

    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (isMounted) {
        setLoading(true);
        await fetchUserProfile(session?.user);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      authListener.subscription.unsubscribe();
    };
  }, [supabase, fetchUserProfile, supabaseLoading]);

  const login = async (identifier, password) => {
    if (!supabase) {
      throw new Error("Supabase client is not initialized.");
    }

    let email = identifier;
    if (!identifier.includes('@')) {
        const { data: profile, error: profileError } = await supabase
            .from('user_profiles')
            .select('email')
            .eq('username', identifier)
            .single();

        if (profileError || !profile) {
            throw new Error("Invalid username or password.");
        }
        email = profile.email;
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    
    const userProfile = await fetchUserProfile(data.user);
    if (!userProfile) {
      console.warn("User is logged in, but profile data is incomplete.");
    }
    
    return { success: true, user: userProfile };
  };

  const logout = async () => {
    if (!supabase) {
      throw new Error("Supabase client is not initialized.");
    }
    await supabase.auth.signOut();
    setUser(null);
  };

  const hasPermission = (permission) => {
    if (user?.role === 'admin' || user?.role === 'super_admin') return true;
    return user?.permissions?.includes(permission);
  };

  const value = {
    user,
    loading,
    login,
    logout,
    hasPermission
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};