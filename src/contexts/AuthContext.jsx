import { createContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext(null);

/**
 * 로그인 세션과 ls_users 프로필을 앱 전체에 제공하는 Provider
 *
 * Props:
 * @param {React.ReactNode} children - 하위 트리 [Required]
 *
 * Example usage:
 * <AuthProvider><App /></AuthProvider>
 */
export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadProfile = async (userId) => {
    if (!userId) {
      setProfile(null);
      return;
    }
    const { data } = await supabase.from('ls_users').select('*').eq('id', userId).single();
    setProfile(data ?? null);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      loadProfile(currentSession?.user?.id).finally(() => setIsLoading(false));
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession);
      loadProfile(currentSession?.user?.id);
    });

    return () => subscription.unsubscribe();
  }, []);

  const refreshProfile = () => loadProfile(session?.user?.id);

  const value = {
    session,
    user: session?.user ?? null,
    profile,
    isLoading,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export { AuthContext };
