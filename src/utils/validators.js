const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^01[0-9]-?\d{3,4}-?\d{4}$/;

/**
 * 이메일 형식 검증
 * @param {string} email - 검증할 이메일 [Required]
 * @returns {boolean} 형식 유효 여부
 */
export function isValidEmail(email) {
  return EMAIL_REGEX.test(email);
}

/**
 * 전화번호 형식 검증 (010-1234-5678 형태)
 * @param {string} phone - 검증할 전화번호 [Required]
 * @returns {boolean} 형식 유효 여부
 */
export function isValidPhone(phone) {
  return PHONE_REGEX.test(phone);
}

/**
 * 비밀번호 형식 검증 (8자 이상)
 * @param {string} password - 검증할 비밀번호 [Required]
 * @returns {boolean} 형식 유효 여부
 */
export function isValidPassword(password) {
  return typeof password === 'string' && password.length >= 8;
}
