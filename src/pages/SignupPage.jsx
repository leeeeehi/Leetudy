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
import { checkEmailExists, signUp } from '../lib/auth';
import { isValidEmail, isValidPhone, isValidPassword } from '../utils/validators';

/**
 * 회원가입 페이지
 */
function SignupPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '', passwordConfirm: '', nickname: '', phone: '' });
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!isValidEmail(form.email)) {
      setErrorMessage('이메일 형식이 올바르지 않아요.');
      return;
    }
    if (!isValidPassword(form.password)) {
      setErrorMessage('비밀번호는 8자 이상이어야 해요.');
      return;
    }
    if (form.password !== form.passwordConfirm) {
      setErrorMessage('비밀번호가 일치하지 않아요.');
      return;
    }
    if (!form.nickname.trim()) {
      setErrorMessage('닉네임을 입력해주세요.');
      return;
    }
    if (!isValidPhone(form.phone)) {
      setErrorMessage('전화번호 형식이 올바르지 않아요. (예: 010-1234-5678)');
      return;
    }

    setIsSubmitting(true);
    try {
      const emailExists = await checkEmailExists(form.email);
      if (emailExists) {
        setErrorMessage('이미 가입된 이메일이에요.');
        return;
      }

      const { session } = await signUp({
        email: form.email,
        password: form.password,
        nickname: form.nickname.trim(),
        phone: form.phone.trim(),
      });

      if (session) {
        navigate('/');
      } else {
        setSuccessMessage('가입이 완료되었어요. 로그인해주세요.');
      }
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
          회원가입
        </Typography>

        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
          {successMessage && <Alert severity="success">{successMessage}</Alert>}

          <TextField label="이메일" type="email" value={form.email} onChange={handleChange('email')} required fullWidth />
          <TextField
            label="비밀번호"
            type="password"
            value={form.password}
            onChange={handleChange('password')}
            required
            fullWidth
            helperText="8자 이상"
          />
          <TextField
            label="비밀번호 확인"
            type="password"
            value={form.passwordConfirm}
            onChange={handleChange('passwordConfirm')}
            required
            fullWidth
          />
          <TextField label="닉네임" value={form.nickname} onChange={handleChange('nickname')} required fullWidth />
          <TextField
            label="전화번호"
            value={form.phone}
            onChange={handleChange('phone')}
            required
            fullWidth
            placeholder="010-1234-5678"
          />

          <Button type="submit" variant="contained" size="large" disabled={isSubmitting}>
            회원가입
          </Button>

          <Typography variant="body2" sx={{ textAlign: 'center' }}>
            이미 계정이 있으신가요? <Link component={RouterLink} to="/login">로그인</Link>
          </Typography>
        </Box>
      </Paper>
    </PageContainer>
  );
}

export default SignupPage;
