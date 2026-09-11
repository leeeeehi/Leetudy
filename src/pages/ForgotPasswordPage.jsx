import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Link from '@mui/material/Link';

import PageContainer from '../components/common/PageContainer';
import { requestPasswordReset } from '../lib/auth';

/**
 * 비밀번호 찾기(재설정 메일 요청) 페이지
 */
function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setIsSubmitting(true);
    try {
      await requestPasswordReset(email);
      setSuccessMessage('비밀번호 재설정 메일을 보냈어요. 메일함을 확인해주세요.');
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageContainer maxWidth="sm">
      <Paper variant="outlined" sx={{ p: { xs: 3, md: 4 } }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
          비밀번호 찾기
        </Typography>

        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
          {successMessage && <Alert severity="success">{successMessage}</Alert>}

          <TextField
            label="가입한 이메일"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            fullWidth
          />

          <Button type="submit" variant="contained" size="large" disabled={isSubmitting}>
            재설정 메일 보내기
          </Button>

          <Typography variant="body2" sx={{ textAlign: 'center' }}>
            <Link component={RouterLink} to="/login">로그인으로 돌아가기</Link>
          </Typography>
        </Box>
      </Paper>
    </PageContainer>
  );
}

export default ForgotPasswordPage;
