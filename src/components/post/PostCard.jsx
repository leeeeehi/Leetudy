import { Link as RouterLink } from 'react-router-dom';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardMedia from '@mui/material/CardMedia';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutlineOutlined';
import StarIcon from '@mui/icons-material/Star';

import { formatDate } from '../../utils/date';

/**
 * 게시물 목록 카드
 *
 * Props:
 * @param {object} post - 게시물 데이터(author, category, images, like_count, comment_count 포함) [Required]
 * @param {object[]} recentComments - 최근 댓글 최대 2개 [Optional, 기본값: []]
 * @param {boolean} isLiked - 로그인한 사용자의 좋아요 여부 [Optional, 기본값: false]
 * @param {boolean} isBest - 좋아요 상위 BEST 게시물 여부 [Optional, 기본값: false]
 * @param {function} onToggleLike - 좋아요 버튼 클릭 시 실행할 함수(postId) [Optional]
 *
 * Example usage:
 * <PostCard post={post} recentComments={comments} isLiked isBest onToggleLike={handleToggle} />
 */
function PostCard({ post, recentComments = [], isLiked = false, isBest = false, onToggleLike }) {
  const thumbnail = post.images?.[0]?.image_url;

  const handleLikeClick = (event) => {
    event.preventDefault();
    event.stopPropagation();
    onToggleLike?.(post.id);
  };

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        ...(isBest && {
          border: '2px solid',
          borderColor: 'warning.main',
          boxShadow: (theme) => `0 4px 14px ${theme.palette.warning.main}4d`,
        }),
      }}
      variant="outlined"
    >
      <CardActionArea component={RouterLink} to={`/posts/${post.id}`} sx={{ flexGrow: 1, alignItems: 'stretch', display: 'flex', flexDirection: 'column' }}>
        {isBest && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              bgcolor: 'warning.main',
              color: '#fff',
              px: 1.5,
              py: 0.5,
            }}
          >
            <StarIcon sx={{ fontSize: 14 }} />
            <Typography variant="caption" sx={{ fontWeight: 700, lineHeight: 1, letterSpacing: 0.5 }}>
              BEST 인기 게시물
            </Typography>
          </Box>
        )}
        {thumbnail && (
          <CardMedia component="img" image={thumbnail} alt="" sx={{ height: 160, objectFit: 'cover' }} />
        )}
        <Box sx={{ p: { xs: 2, md: 2.5 }, display: 'flex', flexDirection: 'column', gap: 1, flexGrow: 1 }}>
          {post.category?.name && (
            <Chip label={post.category.name} size="small" color="primary" variant="outlined" sx={{ alignSelf: 'flex-start' }} />
          )}
          <Typography variant="subtitle1" sx={{ fontWeight: 700, fontSize: { xs: '1rem', md: '1.1rem' } }}>
            {post.title}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, color: 'text.secondary', fontSize: '0.8rem' }}>
            <Box component="span">{post.author?.nickname ?? '알 수 없음'}</Box>
            <Box component="span">·</Box>
            <Box component="span">{formatDate(post.created_at)}</Box>
          </Box>
          {post.memo && (
            <Box
              sx={{
                fontSize: '0.85rem',
                color: 'text.secondary',
                bgcolor: 'warning.light',
                opacity: 0.6,
                borderRadius: 1,
                px: 1,
                py: 0.5,
                display: '-webkit-box',
                WebkitLineClamp: 1,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              메모: {post.memo}
            </Box>
          )}
          {recentComments.length > 0 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mt: 0.5 }}>
              {recentComments.map((comment) => (
                <Box
                  key={comment.id}
                  sx={{
                    fontSize: '0.8rem',
                    color: 'text.secondary',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <Box component="span" sx={{ fontWeight: 600 }}>
                    {comment.author?.nickname ?? '알 수 없음'}
                  </Box>{' '}
                  {comment.content}
                </Box>
              ))}
            </Box>
          )}
        </Box>
      </CardActionArea>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, px: { xs: 2, md: 2.5 }, pb: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <IconButton size="small" onClick={handleLikeClick} color={isLiked ? 'primary' : 'default'}>
            {isLiked ? <FavoriteIcon fontSize="small" /> : <FavoriteBorderIcon fontSize="small" />}
          </IconButton>
          <Typography variant="caption" color="text.secondary">
            {post.like_count}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <ChatBubbleOutlineIcon fontSize="small" sx={{ color: 'text.secondary' }} />
          <Typography variant="caption" color="text.secondary">
            {post.comment_count}
          </Typography>
        </Box>
      </Box>
    </Card>
  );
}

export default PostCard;
