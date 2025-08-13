import React, { createContext, useContext, useState, useEffect } from 'react';
    import { supabase as customSupabaseClient } from '@/lib/customSupabaseClient';
    import { toast } from '@/components/ui/use-toast';

    const SupabaseContext = createContext(null);

    export const useSupabase = () => {
      const context = useContext(SupabaseContext);
      if (context === undefined) {
        throw new Error('useSupabase must be used within a SupabaseProvider');
      }
      return context;
    };

    export const SupabaseProvider = ({ children }) => {
      const [supabase, setSupabase] = useState(null);
      const [loading, setLoading] = useState(true);

      useEffect(() => {
        if (customSupabaseClient) {
          setSupabase(customSupabaseClient);
        } else {
          console.error("Supabase client from customSupabaseClient is null or undefined.");
          toast({
            title: "Supabase Connection Error",
            description: "Could not initialize Supabase client. Please check the configuration.",
            variant: "destructive",
          });
        }
        setLoading(false);
      }, []);

      return (
        <SupabaseContext.Provider value={{ supabase, loading }}>
          {!loading && children}
        </SupabaseContext.Provider>
      );
    };