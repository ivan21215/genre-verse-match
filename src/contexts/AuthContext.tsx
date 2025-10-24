import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Profile {
  id: string;
  user_id: string;
  name: string;
  business_type: 'venue' | 'club' | 'user' | null;
  address: string | null;
  created_at: string;
  updated_at: string;
}

interface UserRole {
  id: string;
  user_id: string;
  role: 'venue_owner' | 'user';
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  userRoles: UserRole[];
  loading: boolean;
  isVenueOwner: boolean;
  signUp: (email: string, password: string, name: string, userType: 'venue' | 'club' | 'user', address: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Check if user is a venue owner based on user_roles table
  const isVenueOwner = userRoles.some(role => role.role === 'venue_owner');

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Fetch user profile and roles
          setTimeout(async () => {
            const [profileResult, rolesResult] = await Promise.all([
              supabase
                .from('profiles')
                .select('*')
                .eq('user_id', session.user.id)
                .single(),
              supabase
                .from('user_roles')
                .select('*')
                .eq('user_id', session.user.id)
            ]);
            
            setProfile(profileResult.data as Profile);
            setUserRoles(rolesResult.data as UserRole[] || []);
          }, 0);
        } else {
          setProfile(null);
          setUserRoles([]);
        }
        
        setLoading(false);
      }
    );

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        Promise.all([
          supabase
            .from('profiles')
            .select('*')
            .eq('user_id', session.user.id)
            .single(),
          supabase
            .from('user_roles')
            .select('*')
            .eq('user_id', session.user.id)
        ]).then(([profileResult, rolesResult]) => {
          setProfile(profileResult.data as Profile);
          setUserRoles(rolesResult.data as UserRole[] || []);
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, name: string, userType: 'venue' | 'club' | 'user', address: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: {
          name,
          business_type: userType,
          address: userType === 'user' ? null : address
        }
      }
    });
    
    // After signup, insert the appropriate role
    if (!error && data.user) {
      const role = (userType === 'venue' || userType === 'club') ? 'venue_owner' : 'user';
      await supabase.from('user_roles').insert({
        user_id: data.user.id,
        role: role
      });
    }
    
    if (error) {
      toast({
        title: "Sign Up Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Please check your email to confirm your account.",
      });
    }
    
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      let errorMessage = error.message;
      
      // Provide more specific error messages
      if (error.message.includes("Invalid login credentials")) {
        errorMessage = "Invalid email or password. If you just signed up, please check your email to confirm your account first.";
      } else if (error.message.includes("Email not confirmed")) {
        errorMessage = "Please check your email and confirm your account before signing in.";
      }
      
      toast({
        title: "Sign In Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
    
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { error: new Error('Not authenticated') };
    
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('user_id', user.id);
      
    if (!error) {
      setProfile(prev => prev ? { ...prev, ...updates } : null);
    }
    
    return { error };
  };

  const value = {
    user,
    session,
    profile,
    userRoles,
    loading,
    isVenueOwner,
    signUp,
    signIn,
    signOut,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
