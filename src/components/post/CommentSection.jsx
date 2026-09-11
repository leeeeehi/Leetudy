import { useEffect, useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';

import CommentForm from './CommentForm';
import CommentItem from './CommentItem';
import { useAuth } from '../../hooks/useAuth';
import {
  fetchComments,
  createComment,
  updateComment,
  deleteComment,
  likeComment,
  unlikeComment,
  fetchLikedCommentIds,
} from '../../lib/comments';

/**
 * 게시물 상세 페이지의 댓글 영역 전체(목록 조회, 작성, 대댓글, 좋아요, 수정/삭제)
 *
 * Props:
 * @param {number} postId - 게시물 id [Required]
 *
 * Example usage:
 * <CommentSection postId={post.id} />
 */
function CommentSection({ postId }) {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [likedCommentIds, setLikedCommentIds] = useState(new Set());
  const [errorMessage, setErrorMessage] = useState('');

  const loadComments = async () => {
    try {
      const data = await fetchComments(postId);
      setComments(data);
      if (user) {
        const likedIds = await fetchLikedCommentIds(user.id, data.map((c) => c.id));
        setLikedCommentIds(new Set(likedIds));
      }
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  useEffect(() => {
    loadComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId, user?.id]);

  const childrenByParentId = useMemo(() => {
    const map = new Map();
    for (const comment of comments) {
      const key = comment.parent_comment_id ?? 'root';
      const list = map.get(key) ?? [];
      list.push(comment);
      map.set(key, list);
    }
    return map;
  }, [comments]);

  const getChildren = (parentId) => childrenByParentId.get(parentId) ?? [];
  const rootComments = childrenByParentId.get('root') ?? [];

  const handleCreateRootComment = async (content) => {
    if (!user) return;
    await createComment({ postId, userId: user.id, content });
    await loadComments();
  };

  const handleReply = async (parentCommentId, content) => {
    if (!user) return;
    await createComment({ postId, userId: user.id, content, parentCommentId });
    await loadComments();
  };

  const handleEdit = async (commentId, content) => {
    await updateComment(commentId, content);
    await loadComments();
  };

  const handleDelete = async (commentId) => {
    if (!window.confirm('댓글을 삭제할까요?')) return;
    await deleteComment(commentId);
    await loadComments();
  };

  const handleLikeToggle = async (commentId) => {
    if (!user) return;
    const isLiked = likedCommentIds.has(commentId);
    if (isLiked) {
      await unlikeComment(commentId, user.id);
    } else {
      await likeComment(commentId, user.id);
    }
    await loadComments();
  };

  return (
    <Box sx={{ mt: { xs: 4, md: 6 } }}>
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
        댓글 {comments.length}
      </Typography>

      {errorMessage && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setErrorMessage('')}>
          {errorMessage}
        </Alert>
      )}

      {user ? (
        <Box sx={{ mb: 3 }}>
          <CommentForm onSubmit={handleCreateRootComment} />
        </Box>
      ) : (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          댓글을 작성하려면 로그인해주세요.
        </Typography>
      )}

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        {rootComments.map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            currentUserId={user?.id}
            likedCommentIds={likedCommentIds}
            getChildren={getChildren}
            onLikeToggle={handleLikeToggle}
            onReply={handleReply}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}
        {rootComments.length === 0 && (
          <Typography variant="body2" color="text.secondary">
            아직 댓글이 없어요. 첫 댓글을 남겨보세요!
          </Typography>
        )}
      </Box>
    </Box>
  );
}

export default CommentSection;
