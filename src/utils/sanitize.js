/**
 * 게시글/댓글 본문에 포함될 수 있는 HTML 특수문자를 이스케이프하여 XSS를 방지한다.
 * @param {string} text - 이스케이프할 원본 텍스트 [Required]
 * @returns {string} 이스케이프된 텍스트
 */
export function escapeHtml(text) {
  if (typeof text !== 'string') return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
