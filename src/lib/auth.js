import { supabase } from './supabase';

/**
 * 이메일 중복 여부를 확인한다 (RPC: check_email_exists).
 * @param {string} email - 확인할 이메일 [Required]
 * @returns {Promise<boolean>} 이미 가입된 이메일이면 true
 */
export async function checkEmailExists(email) {
  const { data, error } = await supabase.rpc('check_email_exists', { check_email: email });
  if (error) throw error;
  return data;
}

/**
 * 회원가입 (Supabase Auth + ls_users는 DB 트리거로 자동 생성)
 * @param {string} email - 이메일 [Required]
 * @param {string} password - 비밀번호 [Required]
 * @param {string} nickname - 닉네임 [Required]
 * @param {string} phone - 전화번호 [Required]
 * @returns {Promise<object>} Supabase Auth signUp 결과
 */
export async function signUp({ email, password, nickname, phone }) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { nickname, phone },
    },
  });
  if (error) throw error;
  return data;
}

/**
 * 로그인
 * @param {string} email - 이메일 [Required]
 * @param {string} password - 비밀번호 [Required]
 * @returns {Promise<object>} Supabase Auth signInWithPassword 결과
 */
export async function signIn({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

/**
 * 로그아웃
 * @returns {Promise<void>}
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

/**
 * 비밀번호 재설정 메일 요청
 * @param {string} email - 대상 이메일 [Required]
 * @returns {Promise<void>}
 */
export async function requestPasswordReset(email) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}${import.meta.env.BASE_URL}reset-password`,
  });
  if (error) throw error;
}

/**
 * 로그인 상태에서 새 비밀번호로 변경
 * @param {string} newPassword - 새 비밀번호 [Required]
 * @returns {Promise<void>}
 */
export async function updatePassword(newPassword) {
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw error;
}

/**
 * 마이페이지 프로필(닉네임/프로필 사진) 수정
 * @param {string} userId - 사용자 id [Required]
 * @param {object} updates - 변경할 필드 (nickname, profile_image_url) [Required]
 * @returns {Promise<object>} 수정된 ls_users 행
 */
export async function updateProfile(userId, updates) {
  const { data, error } = await supabase
    .from('ls_users')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();
  if (error) throw error;
  return data;
}
