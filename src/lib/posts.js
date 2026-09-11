import { supabase } from './supabase';

const PAGE_SIZE = 10;
const POST_SELECT = `
  id, title, content, memo, like_count, comment_count, created_at, updated_at, user_id, category_id,
  author:ls_users(id, nickname, profile_image_url),
  category:ls_categories(id, name),
  images:ls_post_images(id, image_url)
`;

/**
 * 게시물 목록을 검색어/카테고리/페이지 조건으로 조회한다.
 * @param {object} params - 조회 조건 [Required]
 * @param {string} params.search - 제목/내용/작성자 검색어 [Optional]
 * @param {number} params.categoryId - 카테고리 id [Optional]
 * @param {number} params.page - 0부터 시작하는 페이지 번호 [Optional, 기본값: 0]
 * @returns {Promise<{ posts: object[], totalCount: number }>} 게시물 목록과 총 개수
 */
export async function fetchPosts({ search = '', categoryId = null, page = 0 } = {}) {
  let query = supabase
    .from('ls_posts')
    .select(POST_SELECT, { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1);

  if (categoryId) {
    query = query.eq('category_id', categoryId);
  }
  if (search) {
    const { data: matchedAuthors } = await supabase
      .from('ls_users')
      .select('id')
      .ilike('nickname', `%${search}%`);
    const orParts = [`title.ilike.%${search}%`, `content.ilike.%${search}%`];
    const authorIds = (matchedAuthors ?? []).map((row) => row.id);
    if (authorIds.length > 0) {
      orParts.push(`user_id.in.(${authorIds.join(',')})`);
    }
    query = query.or(orParts.join(','));
  }

  const { data, error, count } = await query;
  if (error) throw error;
  return { posts: data ?? [], totalCount: count ?? 0 };
}

const BEST_POST_COUNT = 3;

/**
 * 좋아요 수 기준 상위 게시물(BEST) id 목록을 조회한다.
 * @returns {Promise<number[]>} 좋아요 수 상위 게시물 id 목록
 */
export async function fetchBestPostIds() {
  const { data, error } = await supabase
    .from('ls_posts')
    .select('id')
    .gt('like_count', 0)
    .order('like_count', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(BEST_POST_COUNT);
  if (error) throw error;
  return (data ?? []).map((row) => row.id);
}

/**
 * 게시물 상세를 조회한다.
 * @param {number} postId - 게시물 id [Required]
 * @returns {Promise<object>} 게시물 상세 데이터
 */
export async function fetchPostById(postId) {
  const { data, error } = await supabase
    .from('ls_posts')
    .select(POST_SELECT)
    .eq('id', postId)
    .single();
  if (error) throw error;
  return data;
}

/**
 * 전체 카테고리 목록을 조회한다.
 * @returns {Promise<object[]>} 카테고리 목록
 */
export async function fetchCategories() {
  const { data, error } = await supabase.from('ls_categories').select('id, name').order('id');
  if (error) throw error;
  return data ?? [];
}

/**
 * 게시물을 작성한다.
 * @param {object} post - 작성할 게시물 정보 [Required]
 * @param {string} post.userId - 작성자 id [Required]
 * @param {number} post.categoryId - 카테고리 id [Required]
 * @param {string} post.title - 제목 [Required]
 * @param {string} post.content - 본문 [Required]
 * @param {string} post.memo - 메모 [Optional]
 * @param {string[]} post.imageUrls - 첨부 이미지 URL 목록 [Optional]
 * @returns {Promise<object>} 생성된 게시물
 */
export async function createPost({ userId, categoryId, title, content, memo, imageUrls = [] }) {
  const { data: created, error } = await supabase
    .from('ls_posts')
    .insert({ user_id: userId, category_id: categoryId, title, content, memo })
    .select()
    .single();
  if (error) throw error;

  if (imageUrls.length > 0) {
    const rows = imageUrls.map((imageUrl) => ({ post_id: created.id, image_url: imageUrl }));
    const { error: imageError } = await supabase.from('ls_post_images').insert(rows);
    if (imageError) throw imageError;
  }

  return created;
}

/**
 * 게시물을 수정한다.
 * @param {number} postId - 수정할 게시물 id [Required]
 * @param {object} updates - 변경할 필드 (category_id, title, content, memo) [Required]
 * @param {string[]} newImageUrls - 새로 추가할 이미지 URL 목록 [Optional]
 * @returns {Promise<object>} 수정된 게시물
 */
export async function updatePost(postId, updates, newImageUrls = []) {
  const { data, error } = await supabase
    .from('ls_posts')
    .update(updates)
    .eq('id', postId)
    .select()
    .single();
  if (error) throw error;

  if (newImageUrls.length > 0) {
    const rows = newImageUrls.map((imageUrl) => ({ post_id: postId, image_url: imageUrl }));
    const { error: imageError } = await supabase.from('ls_post_images').insert(rows);
    if (imageError) throw imageError;
  }

  return data;
}

/**
 * 게시물 사진 한 장을 삭제한다.
 * @param {number} imageId - 삭제할 ls_post_images.id [Required]
 * @returns {Promise<void>}
 */
export async function deletePostImage(imageId) {
  const { error } = await supabase.from('ls_post_images').delete().eq('id', imageId);
  if (error) throw error;
}

/**
 * 게시물을 삭제한다.
 * @param {number} postId - 삭제할 게시물 id [Required]
 * @returns {Promise<void>}
 */
export async function deletePost(postId) {
  const { error } = await supabase.from('ls_posts').delete().eq('id', postId);
  if (error) throw error;
}

/**
 * 특정 사용자가 좋아요한 게시물 id 목록을 조회한다.
 * @param {string} userId - 사용자 id [Required]
 * @param {number[]} postIds - 조회 대상 게시물 id 목록 [Required]
 * @returns {Promise<number[]>} 좋아요한 게시물 id 목록
 */
export async function fetchLikedPostIds(userId, postIds) {
  if (!userId || postIds.length === 0) return [];
  const { data, error } = await supabase
    .from('ls_post_likes')
    .select('post_id')
    .eq('user_id', userId)
    .in('post_id', postIds);
  if (error) throw error;
  return (data ?? []).map((row) => row.post_id);
}

/**
 * 게시물 좋아요를 추가한다.
 * @param {number} postId - 게시물 id [Required]
 * @param {string} userId - 사용자 id [Required]
 * @returns {Promise<void>}
 */
export async function likePost(postId, userId) {
  const { error } = await supabase.from('ls_post_likes').insert({ post_id: postId, user_id: userId });
  if (error) throw error;
}

/**
 * 게시물 좋아요를 취소한다.
 * @param {number} postId - 게시물 id [Required]
 * @param {string} userId - 사용자 id [Required]
 * @returns {Promise<void>}
 */
export async function unlikePost(postId, userId) {
  const { error } = await supabase
    .from('ls_post_likes')
    .delete()
    .eq('post_id', postId)
    .eq('user_id', userId);
  if (error) throw error;
}

/**
 * 내가 작성한 게시물 목록을 조회한다.
 * @param {string} userId - 사용자 id [Required]
 * @returns {Promise<object[]>} 게시물 목록
 */
export async function fetchPostsByUser(userId) {
  const { data, error } = await supabase
    .from('ls_posts')
    .select(POST_SELECT)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

/**
 * 내가 좋아요한 게시물 목록을 조회한다.
 * @param {string} userId - 사용자 id [Required]
 * @returns {Promise<object[]>} 게시물 목록
 */
export async function fetchLikedPostsByUser(userId) {
  const { data, error } = await supabase
    .from('ls_post_likes')
    .select(`post:ls_posts(${POST_SELECT})`)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map((row) => row.post).filter(Boolean);
}
