import { useState } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';

/**
 * 댓글/대댓글/댓글수정 공용 입력 폼
 *
 * Props:
 * @param {string} initialValue - 초기 입력값(수정 시 기존 댓글 내용) [Optional, 기본값: '']
 * @param {string} placeholder - placeholder 문구 [Optional, 기본값: '댓글을 남겨보세요']
 * @param {string} submitLabel - 제출 버튼 텍스트 [Optional, 기본값: '등록']
 * @param {function} onSubmit - 제출 시 실행할 함수(content) [Required]
 * @param {function} onCancel - 취소 버튼 클릭 시 실행할 함수 [Optional]
 *
 * Example usage:
 * <CommentForm onSubmit={handleCreateComment} />
 */
function CommentForm({ initialValue = '', placeholder = '댓글을 남겨보세요', submitLabel = '등록', onSubmit, onCancel }) {
  const [content, setContent] = useState(initialValue);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const trimmed = content.trim();
    if (!trimmed) return;
    setIsSubmitting(true);
    try {
      await onSubmit(trimmed);
      setContent('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
      <TextField
        value={content}
        onChange={(event) => setContent(event.target.value)}
        placeholder={placeholder}
        multiline
        minRows={1}
        maxRows={6}
        fullWidth
        size="small"
      />
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Button type="submit" variant="contained" size="small" disabled={isSubmitting || !content.trim()}>
          {submitLabel}
        </Button>
        {onCancel && (
          <Button size="small" onClick={onCancel}>
            취소
          </Button>
        )}
      </Box>
    </Box>
  );
}

export default CommentForm;
