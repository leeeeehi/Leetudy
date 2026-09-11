import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';

import PageContainer from '../components/common/PageContainer';
import { updatePassword } from '../lib/auth';
import { isValidPassword } from '../utils/validators';

/**
 * 비밀번호 재설정 메일 링크로 진입해 새 비밀번호를 설정하는 페이지
 */
function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage('');

    if (!isValidPassword(password)) {
      setErrorMessage('비밀번호는 8자 이상이어야 해요.');
      return;
    }
    if (password !== passwordConfirm) {
      setErrorMessage('비밀번호가 일치하지 않아요.');
      return;
    }

    setIsSubmitting(true);
    try {
      await updatePassword(password);
      navigate('/login');
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
          새 비밀번호 설정
        </Typography>

        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

          <TextField
            label="새 비밀번호"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            fullWidth
            helperText="8자 이상"
          />
          <TextField
            label="새 비밀번호 확인"
            type="password"
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            required
            fullWidth
          />

          <Button type="submit" variant="contained" size="large" disabled={isSubmitting}>
            비밀번호 변경
          </Button>
        </Box>
      </Paper>
    </PageContainer>
  );
}

export default ResetPasswordPage;
