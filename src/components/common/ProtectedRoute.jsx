import { Navigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';

import { useAuth } from '../../hooks/useAuth';

/**
 * 로그인한 사용자만 접근 가능한 라우트로 감싸는 컴포넌트
 *
 * Props:
 * @param {React.ReactNode} children - 로그인 시 보여줄 화면 [Required]
 *
 * Example usage:
 * <ProtectedRoute><MyPage /></ProtectedRoute>
 */
function ProtectedRoute({ children }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;
