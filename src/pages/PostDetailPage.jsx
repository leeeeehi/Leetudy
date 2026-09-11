import { useEffect, useState } from 'react';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';

import PageContainer from '../components/common/PageContainer';
import CommentSection from '../components/post/CommentSection';
import { useAuth } from '../hooks/useAuth';
import { fetchPostById, deletePost, likePost, unlikePost, fetchLikedPostIds } from '../lib/posts';
import { formatDateTime } from '../utils/date';
import { escapeHtml } from '../utils/sanitize';

/**
 * 게시물 상세 페이지
 */
function PostDetailPage() {
  const { postId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isActive = true;
    setIsLoading(true);
    fetchPostById(postId)
      .then(async (data) => {
        if (!isActive) return;
        setPost(data);
        if (user) {
          const likedIds = await fetchLikedPostIds(user.id, [data.id]);
          if (isActive) setIsLiked(likedIds.includes(data.id));
        }
      })
      .catch((error) => setErrorMessage(error.message))
      .finally(() => isActive && setIsLoading(false));
    return () => {
      isActive = false;
    };
  }, [postId, user]);

  const handleToggleLike = async () => {
    if (!user || !post) return;
    try {
      if (isLiked) {
        await unlikePost(post.id, user.id);
        setPost((prev) => ({ ...prev, like_count: prev.like_count - 1 }));
      } else {
        await likePost(post.id, user.id);
        setPost((prev) => ({ ...prev, like_count: prev.like_count + 1 }));
      }
      setIsLiked((prev) => !prev);
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  const handleDelete = async () => {
    if (!post || !window.confirm('게시물을 삭제할까요?')) return;
    try {
      await deletePost(post.id);
      navigate('/');
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  if (isLoading) {
    return (
      <PageContainer maxWidth="md">
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress color="primary" />
        </Box>
      </PageContainer>
    );
  }

  if (errorMessage && !post) {
    return (
      <PageContainer maxWidth="md">
        <Alert severity="error">{errorMessage}</Alert>
      </PageContainer>
    );
  }

  if (!post) return null;

  const isOwner = user && user.id === post.user_id;

  return (
    <PageContainer maxWidth="md">
      <Paper variant="outlined" sx={{ p: { xs: 2.5, md: 4 } }}>
        {errorMessage && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setErrorMessage('')}>
            {errorMessage}
          </Alert>
        )}

        {post.category?.name && <Chip label={post.category.name} size="small" color="primary" variant="outlined" sx={{ mb: 1.5 }} />}

        <Typography variant="h5" sx={{ fontWeight: 700, mb: 1, fontSize: { xs: '1.4rem', md: '1.75rem' } }}>
          {post.title}
        </Typography>

        <Box sx={{ display: 'flex', gap: 1, color: 'text.secondary', fontSize: '0.85rem', mb: 3 }}>
          <Box component="span">{post.author?.nickname ?? '알 수 없음'}</Box>
          <Box component="span">·</Box>
          <Box component="span">{formatDateTime(post.created_at)}</Box>
        </Box>

        {post.images?.length > 0 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 3 }}>
            {post.images.map((image) => (
              <Box
                key={image.id}
                component="img"
                src={image.image_url}
                alt=""
                sx={{ width: '100%', borderRadius: 2, maxHeight: 480, objectFit: 'cover' }}
              />
            ))}
          </Box>
        )}

        <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', mb: post.memo ? 2 : 0 }}>
          {escapeHtml(post.content)}
        </Typography>

        {post.memo && (
          <Box sx={{ bgcolor: 'warning.light', opacity: 0.7, borderRadius: 2, p: 2, mb: 1 }}>
            <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', mb: 0.5 }}>
              메모
            </Typography>
            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
              {escapeHtml(post.memo)}
            </Typography>
          </Box>
        )}

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <IconButton onClick={handleToggleLike} color={isLiked ? 'primary' : 'default'} disabled={!user}>
              {isLiked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
            </IconButton>
            <Typography variant="body2" color="text.secondary">
              좋아요 {post.like_count}
            </Typography>
          </Box>

          {isOwner && (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button component={RouterLink} to={`/posts/${post.id}/edit`} size="small">
                수정
              </Button>
              <Button size="small" color="error" onClick={handleDelete}>
                삭제
              </Button>
            </Box>
          )}
        </Box>
      </Paper>

      <CommentSection postId={post.id} />
    </PageContainer>
  );
}

export default PostDetailPage;
