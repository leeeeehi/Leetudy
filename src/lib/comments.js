import { supabase } from './supabase';

const COMMENT_SELECT = `
  id, post_id, parent_comment_id, content, like_count, created_at, updated_at, user_id,
  author:ls_users(id, nickname, profile_image_url)
`;

/**
 * 게시물의 댓글(대댓글 포함)을 작성일순으로 조회한다.
 * @param {number} postId - 게시물 id [Required]
 * @returns {Promise<object[]>} 댓글 목록
 */
export async function fetchComments(postId) {
  const { data, error } = await supabase
    .from('ls_comments')
    .select(COMMENT_SELECT)
    .eq('post_id', postId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

/**
 * 댓글 또는 대댓글을 작성한다.
 * @param {object} comment - 작성할 댓글 정보 [Required]
 * @param {number} comment.postId - 게시물 id [Required]
 * @param {string} comment.userId - 작성자 id [Required]
 * @param {string} comment.content - 댓글 내용 [Required]
 * @param {number} comment.parentCommentId - 부모 댓글 id (대댓글일 때만) [Optional]
 * @returns {Promise<object>} 생성된 댓글
 */
export async function createComment({ postId, userId, content, parentCommentId = null }) {
  const { data, error } = await supabase
    .from('ls_comments')
    .insert({
      post_id: postId,
      user_id: userId,
      content,
      parent_comment_id: parentCommentId,
    })
    .select(COMMENT_SELECT)
    .single();
  if (error) throw error;
  return data;
}

/**
 * 댓글 내용을 수정한다.
 * @param {number} commentId - 수정할 댓글 id [Required]
 * @param {string} content - 새 댓글 내용 [Required]
 * @returns {Promise<object>} 수정된 댓글
 */
export async function updateComment(commentId, content) {
  const { data, error } = await supabase
    .from('ls_comments')
    .update({ content })
    .eq('id', commentId)
    .select(COMMENT_SELECT)
    .single();
  if (error) throw error;
  return data;
}

/**
 * 댓글을 삭제한다.
 * @param {number} commentId - 삭제할 댓글 id [Required]
 * @returns {Promise<void>}
 */
export async function deleteComment(commentId) {
  const { error } = await supabase.from('ls_comments').delete().eq('id', commentId);
  if (error) throw error;
}

/**
 * 내가 좋아요한 댓글 id 목록을 조회한다.
 * @param {string} userId - 사용자 id [Required]
 * @param {number[]} commentIds - 조회 대상 댓글 id 목록 [Required]
 * @returns {Promise<number[]>} 좋아요한 댓글 id 목록
 */
export async function fetchLikedCommentIds(userId, commentIds) {
  if (!userId || commentIds.length === 0) return [];
  const { data, error } = await supabase
    .from('ls_comment_likes')
    .select('comment_id')
    .eq('user_id', userId)
    .in('comment_id', commentIds);
  if (error) throw error;
  return (data ?? []).map((row) => row.comment_id);
}

/**
 * 댓글 좋아요를 추가한다.
 * @param {number} commentId - 댓글 id [Required]
 * @param {string} userId - 사용자 id [Required]
 * @returns {Promise<void>}
 */
export async function likeComment(commentId, userId) {
  const { error } = await supabase
    .from('ls_comment_likes')
    .insert({ comment_id: commentId, user_id: userId });
  if (error) throw error;
}

/**
 * 댓글 좋아요를 취소한다.
 * @param {number} commentId - 댓글 id [Required]
 * @param {string} userId - 사용자 id [Required]
 * @returns {Promise<void>}
 */
export async function unlikeComment(commentId, userId) {
  const { error } = await supabase
    .from('ls_comment_likes')
    .delete()
    .eq('comment_id', commentId)
    .eq('user_id', userId);
  if (error) throw error;
}

/**
 * 게시물 목록 카드에 보여줄 '최근 댓글 2개'를 게시물별로 묶어 조회한다.
 * @param {number[]} postIds - 조회 대상 게시물 id 목록 [Required]
 * @returns {Promise<Record<number, object[]>>} 게시물 id를 key로 하는 최근 댓글 2개 목록 맵
 */
export async function fetchRecentCommentsByPostIds(postIds) {
  if (postIds.length === 0) return {};
  const { data, error } = await supabase
    .from('ls_comments')
    .select(COMMENT_SELECT)
    .in('post_id', postIds)
    .order('created_at', { ascending: false });
  if (error) throw error;

  const grouped = {};
  for (const comment of data ?? []) {
    const list = grouped[comment.post_id] ?? [];
    if (list.length < 2) {
      list.push(comment);
      grouped[comment.post_id] = list;
    }
  }
  return grouped;
}

/**
 * 내가 작성한 댓글 목록을 조회한다.
 * @param {string} userId - 사용자 id [Required]
 * @returns {Promise<object[]>} 댓글 목록
 */
export async function fetchCommentsByUser(userId) {
  const { data, error } = await supabase
    .from('ls_comments')
    .select(`${COMMENT_SELECT}, post:ls_posts(id, title)`)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}
