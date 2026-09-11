import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Avatar from '@mui/material/Avatar';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ParkIcon from '@mui/icons-material/Park';

import { useAuth } from '../../hooks/useAuth';
import { signOut } from '../../lib/auth';

/**
 * 상단 헤더 (로고/네비게이션/로그인 상태별 메뉴)
 *
 * Example usage:
 * <Header />
 */
function Header() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleLogout = async () => {
    handleMenuClose();
    await signOut();
    navigate('/');
  };

  return (
    <AppBar position="sticky" color="default" elevation={0} sx={{ borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
      <Toolbar sx={{ px: { xs: 2, md: 3 }, gap: 2 }}>
        <Box
          component={RouterLink}
          to="/"
          sx={{ display: 'flex', alignItems: 'center', gap: 1, textDecoration: 'none', color: 'text.primary', flexGrow: 1 }}
        >
          <ParkIcon sx={{ color: 'primary.main' }} />
          <Typography variant="h6" sx={{ fontWeight: 700, fontSize: { xs: '1.1rem', md: '1.25rem' } }}>
            Leetudy
          </Typography>
        </Box>

        {user ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Button component={RouterLink} to="/write" variant="contained" size="small" sx={{ display: { xs: 'none', sm: 'inline-flex' } }}>
              글쓰기
            </Button>
            <IconButton onClick={handleMenuOpen} size="small">
              <Avatar
                src={profile?.profile_image_url || undefined}
                sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}
              >
                {profile?.nickname?.[0] ?? '?'}
              </Avatar>
            </IconButton>
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
              <MenuItem component={RouterLink} to="/write" onClick={handleMenuClose} sx={{ display: { xs: 'flex', sm: 'none' } }}>
                글쓰기
              </MenuItem>
              <MenuItem component={RouterLink} to="/mypage" onClick={handleMenuClose}>
                마이페이지
              </MenuItem>
              <MenuItem onClick={handleLogout}>로그아웃</MenuItem>
            </Menu>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button component={RouterLink} to="/login" size="small">
              로그인
            </Button>
            <Button component={RouterLink} to="/signup" variant="contained" size="small">
              회원가입
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
}

export default Header;
