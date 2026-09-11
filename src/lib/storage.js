import { supabase } from './supabase';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_SIZE_BYTES = 5 * 1024 * 1024;

/**
 * 업로드 전 이미지 파일의 확장자/용량을 검증한다.
 * @param {File} file - 검증할 파일 [Required]
 * @returns {void}
 */
export function assertValidImageFile(file) {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('jpg, png, webp, gif 형식의 이미지만 업로드할 수 있어요.');
  }
  if (file.size > MAX_SIZE_BYTES) {
    throw new Error('이미지 용량은 5MB 이하여야 해요.');
  }
}

/**
 * 프로필 사진을 avatars 버킷의 사용자 전용 폴더에 업로드한다.
 * @param {File} file - 업로드할 이미지 파일 [Required]
 * @param {string} userId - 업로드하는 사용자 id [Required]
 * @returns {Promise<string>} 공개 URL
 */
export async function uploadAvatar(file, userId) {
  assertValidImageFile(file);
  const path = `${userId}/${Date.now()}-${file.name}`;
  const { error } = await supabase.storage.from('avatars').upload(path, file, { upsert: true });
  if (error) throw error;
  const { data } = supabase.storage.from('avatars').getPublicUrl(path);
  return data.publicUrl;
}

/**
 * 게시물 사진들을 post-images 버킷의 사용자 전용 폴더에 업로드한다.
 * @param {File[]} files - 업로드할 이미지 파일 목록 [Required]
 * @param {string} userId - 업로드하는 사용자 id [Required]
 * @returns {Promise<string[]>} 공개 URL 목록
 */
export async function uploadPostImages(files, userId) {
  const urls = [];
  for (const file of files) {
    assertValidImageFile(file);
    const path = `${userId}/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from('post-images').upload(path, file);
    if (error) throw error;
    const { data } = supabase.storage.from('post-images').getPublicUrl(path);
    urls.push(data.publicUrl);
  }
  return urls;
}
