import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Link from '@mui/material/Link';

import PageContainer from '../components/common/PageContainer';
import { signIn } from '../lib/auth';

/**
 * 로그인 페이지
 */
function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);
    try {
      await signIn({ email, password });
      navigate('/');
    } catch {
      setErrorMessage('이메일 또는 비밀번호가 올바르지 않아요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageContainer maxWidth="sm">
      <Paper variant="outlined" sx={{ p: { xs: 3, md: 4 } }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
          로그인
        </Typography>

        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

          <TextField
            label="이메일"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            fullWidth
          />
          <TextField
            label="비밀번호"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            fullWidth
          />

          <Button type="submit" variant="contained" size="large" disabled={isSubmitting}>
            로그인
          </Button>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
            <Link component={RouterLink} to="/signup" variant="body2">
              회원가입
            </Link>
            <Link component={RouterLink} to="/forgot-password" variant="body2">
              비밀번호 찾기
            </Link>
          </Box>
        </Box>
      </Paper>
    </PageContainer>
  );
}

export default LoginPage;
