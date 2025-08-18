import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useSupabase } from '@/contexts/SupabaseContext';
// import axios from "axios";

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
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = sessionStorage.getItem('token');
    const savedUser = sessionStorage.getItem('user');

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  // تسجيل الدخول
  const login = (userData, tokenData) => {
    sessionStorage.setItem('token', tokenData);
    sessionStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    setToken(tokenData);
  };

  // تسجيل الخروج
  const logout = () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    setUser(null);
    setToken(null);
  };

  const fetchUserProfile = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setUser(null);
        return null;
      }

      const { data } = await axios.get("/api/me", { withCredentials: true });

      // const res = await fetch('http://travel-server.test/api/me', {
      //   method: 'GET',
      //   headers: {
      //     'Authorization': `Bearer ${token}`,
      //     'Content-Type': 'application/vnd.api+json',
      //     'Accept': 'application/vnd.api+json',
      //   },
      // });

      if (!res.ok) {
        console.error("Error fetching user profile:", res.status);
        setUser(null);
        return null;
      }

      // const data = await res.json();

      const userProfile = {
        ...data,
        id: data.id,
        email: data.email,
        username: data.username || data.email?.split('@')[0],
        role: data.role || { name: 'employee' },
        permissions: data.permissions || [],
        canAddItems: data.canAddItems || false,
        default_route: data.default_route || '/attendance',
      };

      setUser(userProfile);

      return userProfile;

    } catch (error) {
      console.error("Critical error in fetchUserProfile:", error.message);
      setUser(null);
      return null;
    }
  }, []);


  useEffect(() => {
    let isMounted = true;

    const getUser = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setUser(null);
          return;
        }

        const res = await fetch('http://travel-server.test/api/me', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/vnd.api+json',
            'Accept': 'application/vnd.api+json',
          },
        });

        if (!res.ok) {
          console.error("Error fetching user profile:", res.status);
          setUser(null);
          return;
        }

        const data = await res.json();

        if (isMounted) {
          const userProfile = {
            ...data,
            id: data.id,
            email: data.email,
            username: data.username || data.email?.split('@')[0],
            role: data.role || { name: 'employee' },
            permissions: data.permissions || [],
            canAddItems: data.canAddItems || false,
            default_route: data.default_route || '/attendance',
          };

          setUser(userProfile);
        }
      } catch (error) {
        console.error("Error getting user:", error.message);
        setUser(null);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    getUser();

    return () => {
      isMounted = false;
    };
  }, []);



  const hasPermission = (permission) => {
    if (user?.role.name === 'admin' || user?.role.name === 'super_admin') return true;
    return user?.permissions?.includes(permission);
  };
  // function to Update Info Of User 
  const updateUser = (updatedUser) => {
    setUser(prev => ({ ...prev, ...updatedUser }));
    sessionStorage.setItem('user', JSON.stringify({ ...user, ...updatedUser }));
  };

  const value = {
    user,
    loading,
    token,
    login,
    logout,
    hasPermission,
    updateUser,
    setUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};