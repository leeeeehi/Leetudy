import { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Avatar from '@mui/material/Avatar';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip';

import PageContainer from '../components/common/PageContainer';
import { useAuth } from '../hooks/useAuth';
import { updateProfile, updatePassword } from '../lib/auth';
import { uploadAvatar } from '../lib/storage';
import { fetchPostsByUser, fetchLikedPostsByUser } from '../lib/posts';
import { fetchCommentsByUser } from '../lib/comments';
import { isValidPassword } from '../utils/validators';
import { formatDate } from '../utils/date';

/**
 * 마이페이지 (프로필/비밀번호 수정, 내가 쓴 글/댓글, 좋아요한 글)
 */
function MyPage() {
  const { user, profile, refreshProfile } = useAuth();
  const [tab, setTab] = useState(0);

  const [nickname, setNickname] = useState(profile?.nickname ?? '');
  const [avatarFile, setAvatarFile] = useState(null);
  const [profileMessage, setProfileMessage] = useState('');
  const [profileError, setProfileError] = useState('');

  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const [myPosts, setMyPosts] = useState([]);
  const [myComments, setMyComments] = useState([]);
  const [likedPosts, setLikedPosts] = useState([]);

  useEffect(() => {
    setNickname(profile?.nickname ?? '');
  }, [profile]);

  useEffect(() => {
    if (!user) return;
    fetchPostsByUser(user.id).then(setMyPosts).catch(() => {});
    fetchCommentsByUser(user.id).then(setMyComments).catch(() => {});
    fetchLikedPostsByUser(user.id).then(setLikedPosts).catch(() => {});
  }, [user]);

  const handleProfileSubmit = async (event) => {
    event.preventDefault();
    setProfileError('');
    setProfileMessage('');
    try {
      let profileImageUrl = profile?.profile_image_url;
      if (avatarFile) {
        profileImageUrl = await uploadAvatar(avatarFile, user.id);
      }
      await updateProfile(user.id, { nickname: nickname.trim(), profile_image_url: profileImageUrl });
      await refreshProfile();
      setAvatarFile(null);
      setProfileMessage('프로필이 수정되었어요.');
    } catch (error) {
      setProfileError(error.message);
    }
  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();
    setPasswordError('');
    setPasswordMessage('');
    if (!isValidPassword(newPassword)) {
      setPasswordError('비밀번호는 8자 이상이어야 해요.');
      return;
    }
    if (newPassword !== newPasswordConfirm) {
      setPasswordError('비밀번호가 일치하지 않아요.');
      return;
    }
    try {
      await updatePassword(newPassword);
      setNewPassword('');
      setNewPasswordConfirm('');
      setPasswordMessage('비밀번호가 변경되었어요.');
    } catch (error) {
      setPasswordError(error.message);
    }
  };

  return (
    <PageContainer maxWidth="md">
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
        마이페이지
      </Typography>

      <Tabs value={tab} onChange={(_e, value) => setTab(value)} variant="scrollable" scrollButtons="auto" sx={{ mb: 3 }}>
        <Tab label="프로필" />
        <Tab label={`내가 쓴 글 (${myPosts.length})`} />
        <Tab label={`내가 쓴 댓글 (${myComments.length})`} />
        <Tab label={`좋아요한 글 (${likedPosts.length})`} />
      </Tabs>

      {tab === 0 && (
        <Paper variant="outlined" sx={{ p: { xs: 2.5, md: 4 }, display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Box component="form" onSubmit={handleProfileSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {profileError && <Alert severity="error">{profileError}</Alert>}
            {profileMessage && <Alert severity="success">{profileMessage}</Alert>}

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar
                src={avatarFile ? URL.createObjectURL(avatarFile) : profile?.profile_image_url || undefined}
                sx={{ width: 72, height: 72, bgcolor: 'secondary.main' }}
              >
                {profile?.nickname?.[0] ?? '?'}
              </Avatar>
              <Button component="label" variant="outlined" size="small">
                사진 변경
                <input type="file" accept="image/*" hidden onChange={(e) => setAvatarFile(e.target.files?.[0] ?? null)} />
              </Button>
            </Box>

            <TextField label="닉네임" value={nickname} onChange={(e) => setNickname(e.target.value)} required />

            <Box>
              <Button type="submit" variant="contained">
                프로필 저장
              </Button>
            </Box>
          </Box>

          <Divider />

          <Box component="form" onSubmit={handlePasswordSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              비밀번호 변경
            </Typography>
            {passwordError && <Alert severity="error">{passwordError}</Alert>}
            {passwordMessage && <Alert severity="success">{passwordMessage}</Alert>}

            <TextField
              label="새 비밀번호"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              helperText="8자 이상"
            />
            <TextField
              label="새 비밀번호 확인"
              type="password"
              value={newPasswordConfirm}
              onChange={(e) => setNewPasswordConfirm(e.target.value)}
            />
            <Box>
              <Button type="submit" variant="outlined">
                비밀번호 변경
              </Button>
            </Box>
          </Box>
        </Paper>
      )}

      {tab === 1 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {myPosts.length === 0 && (
            <Typography variant="body2" color="text.secondary">
              작성한 게시물이 없어요.
            </Typography>
          )}
          {myPosts.map((post) => (
            <Paper
              key={post.id}
              component={RouterLink}
              to={`/posts/${post.id}`}
              variant="outlined"
              sx={{ p: 2, textDecoration: 'none', color: 'inherit', display: 'block' }}
            >
              {post.category?.name && <Chip label={post.category.name} size="small" sx={{ mb: 1 }} />}
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                {post.title}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {formatDate(post.created_at)} · 좋아요 {post.like_count} · 댓글 {post.comment_count}
              </Typography>
            </Paper>
          ))}
        </Box>
      )}

      {tab === 2 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {myComments.length === 0 && (
            <Typography variant="body2" color="text.secondary">
              작성한 댓글이 없어요.
            </Typography>
          )}
          {myComments.map((comment) => (
            <Paper
              key={comment.id}
              component={RouterLink}
              to={`/posts/${comment.post_id}`}
              variant="outlined"
              sx={{ p: 2, textDecoration: 'none', color: 'inherit', display: 'block' }}
            >
              <Typography variant="caption" color="text.secondary">
                {comment.post?.title}
              </Typography>
              <Typography variant="body2" sx={{ mt: 0.5 }}>
                {comment.content}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {formatDate(comment.created_at)}
              </Typography>
            </Paper>
          ))}
        </Box>
      )}

      {tab === 3 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {likedPosts.length === 0 && (
            <Typography variant="body2" color="text.secondary">
              좋아요한 게시물이 없어요.
            </Typography>
          )}
          {likedPosts.map((post) => (
            <Paper
              key={post.id}
              component={RouterLink}
              to={`/posts/${post.id}`}
              variant="outlined"
              sx={{ p: 2, textDecoration: 'none', color: 'inherit', display: 'block' }}
            >
              {post.category?.name && <Chip label={post.category.name} size="small" sx={{ mb: 1 }} />}
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                {post.title}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {post.author?.nickname} · {formatDate(post.created_at)}
              </Typography>
            </Paper>
          ))}
        </Box>
      )}
    </PageContainer>
  );
}

export default MyPage;
