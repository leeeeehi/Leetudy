import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

/**
 * 로그인 세션/프로필(session, user, profile, isLoading, refreshProfile)에 접근하는 훅
 * @returns {{ session: object, user: object, profile: object, isLoading: boolean, refreshProfile: function }}
 *
 * Example usage:
 * const { user, profile } = useAuth();
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth는 AuthProvider 내부에서 사용해야 합니다.');
  }
  return context;
}
