import { useState } from 'react';
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';

import CommentForm from './CommentForm';
import { formatDateTime } from '../../utils/date';
import { escapeHtml } from '../../utils/sanitize';

/**
 * 댓글(대댓글 재귀 렌더링 포함) 한 건
 *
 * Props:
 * @param {object} comment - 댓글 데이터 [Required]
 * @param {object[]} childComments - 이 댓글에 달린 대댓글 목록 [Optional, 기본값: []]
 * @param {string} currentUserId - 현재 로그인한 사용자 id [Optional]
 * @param {Set<number>} likedCommentIds - 좋아요한 댓글 id 집합 [Required]
 * @param {function} getChildren - 특정 댓글 id의 대댓글 목록을 반환하는 함수(commentId) [Required]
 * @param {function} onLikeToggle - 좋아요 토글 함수(commentId) [Required]
 * @param {function} onReply - 대댓글 등록 함수(parentCommentId, content) [Required]
 * @param {function} onEdit - 댓글 수정 함수(commentId, content) [Required]
 * @param {function} onDelete - 댓글 삭제 함수(commentId) [Required]
 * @param {number} depth - 들여쓰기 깊이 [Optional, 기본값: 0]
 *
 * Example usage:
 * <CommentItem comment={c} getChildren={getChildren} likedCommentIds={likedIds} ... />
 */
function CommentItem({
  comment,
  currentUserId,
  likedCommentIds,
  getChildren,
  onLikeToggle,
  onReply,
  onEdit,
  onDelete,
  depth = 0,
}) {
  const [isReplying, setIsReplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const isOwner = currentUserId && currentUserId === comment.user_id;
  const isLiked = likedCommentIds.has(comment.id);
  const children = getChildren(comment.id);

  const handleReplySubmit = async (content) => {
    await onReply(comment.id, content);
    setIsReplying(false);
  };

  const handleEditSubmit = async (content) => {
    await onEdit(comment.id, content);
    setIsEditing(false);
  };

  return (
    <Box sx={{ display: 'flex', gap: 1.5, ml: { xs: depth * 2, md: depth * 3 } }}>
      <Avatar src={comment.author?.profile_image_url || undefined} sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
        {comment.author?.nickname?.[0] ?? '?'}
      </Avatar>
      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          <Typography variant="body2" sx={{ fontWeight: 700 }}>
            {comment.author?.nickname ?? '알 수 없음'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {formatDateTime(comment.created_at)}
          </Typography>
        </Box>

        {isEditing ? (
          <Box sx={{ mt: 0.5 }}>
            <CommentForm
              initialValue={comment.content}
              submitLabel="수정"
              onSubmit={handleEditSubmit}
              onCancel={() => setIsEditing(false)}
            />
          </Box>
        ) : (
          <Typography variant="body2" sx={{ mt: 0.5, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
            {escapeHtml(comment.content)}
          </Typography>
        )}

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
          <IconButton size="small" onClick={() => onLikeToggle(comment.id)} color={isLiked ? 'primary' : 'default'}>
            {isLiked ? <FavoriteIcon sx={{ fontSize: 16 }} /> : <FavoriteBorderIcon sx={{ fontSize: 16 }} />}
          </IconButton>
          <Typography variant="caption" color="text.secondary">
            {comment.like_count}
          </Typography>
          <Button size="small" onClick={() => setIsReplying((prev) => !prev)}>
            답글
          </Button>
          {isOwner && (
            <>
              <Button size="small" onClick={() => setIsEditing((prev) => !prev)}>
                수정
              </Button>
              <Button size="small" color="error" onClick={() => onDelete(comment.id)}>
                삭제
              </Button>
            </>
          )}
        </Box>

        {isReplying && (
          <Box sx={{ mt: 1 }}>
            <CommentForm
              placeholder="답글을 남겨보세요"
              submitLabel="답글 등록"
              onSubmit={handleReplySubmit}
              onCancel={() => setIsReplying(false)}
            />
          </Box>
        )}

        {children.length > 0 && (
          <Box sx={{ mt: 1.5, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {children.map((child) => (
              <CommentItem
                key={child.id}
                comment={child}
                currentUserId={currentUserId}
                likedCommentIds={likedCommentIds}
                getChildren={getChildren}
                onLikeToggle={onLikeToggle}
                onReply={onReply}
                onEdit={onEdit}
                onDelete={onDelete}
                depth={depth + 1}
              />
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default CommentItem;
