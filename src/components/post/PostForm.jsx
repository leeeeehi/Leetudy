import { useState } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import Alert from '@mui/material/Alert';

/**
 * 게시글 작성/수정 공용 폼
 *
 * Props:
 * @param {object[]} categories - 카테고리 목록 [Required]
 * @param {object} initialValues - 초기값(categoryId, title, content, memo) [Optional]
 * @param {object[]} existingImages - 수정 시 기존 첨부 이미지(id, image_url) [Optional, 기본값: []]
 * @param {function} onRemoveExistingImage - 기존 이미지 삭제 함수(imageId) [Optional]
 * @param {function} onSubmit - 제출 함수({ categoryId, title, content, memo, files }) [Required]
 * @param {string} submitLabel - 제출 버튼 텍스트 [Optional, 기본값: '등록']
 *
 * Example usage:
 * <PostForm categories={categories} onSubmit={handleCreate} />
 */
function PostForm({
  categories,
  initialValues = {},
  existingImages = [],
  onRemoveExistingImage,
  onSubmit,
  submitLabel = '등록',
}) {
  const [categoryId, setCategoryId] = useState(initialValues.categoryId ?? '');
  const [title, setTitle] = useState(initialValues.title ?? '');
  const [content, setContent] = useState(initialValues.content ?? '');
  const [memo, setMemo] = useState(initialValues.memo ?? '');
  const [files, setFiles] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = (event) => {
    setFiles(Array.from(event.target.files ?? []));
  };

  const handleRemoveNewFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage('');
    if (!categoryId) {
      setErrorMessage('스터디 주제를 선택해주세요.');
      return;
    }
    if (!title.trim() || !content.trim()) {
      setErrorMessage('제목과 내용을 입력해주세요.');
      return;
    }
    setIsSubmitting(true);
    try {
      await onSubmit({ categoryId, title: title.trim(), content: content.trim(), memo: memo.trim(), files });
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

      <TextField select label="스터디 주제" value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required>
        {categories.map((category) => (
          <MenuItem key={category.id} value={category.id}>
            {category.name}
          </MenuItem>
        ))}
      </TextField>

      <TextField label="제목" value={title} onChange={(e) => setTitle(e.target.value)} required fullWidth />

      <TextField
        label="내용"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        required
        fullWidth
        multiline
        minRows={8}
      />

      <TextField
        label="메모칸"
        value={memo}
        onChange={(e) => setMemo(e.target.value)}
        fullWidth
        multiline
        minRows={2}
        placeholder="나만 보는 스터디 메모를 남겨보세요"
      />

      <Box>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          사진 업로드
        </Typography>

        {existingImages.length > 0 && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
            {existingImages.map((image) => (
              <Box key={image.id} sx={{ position: 'relative', width: 96, height: 96 }}>
                <Box
                  component="img"
                  src={image.image_url}
                  alt=""
                  sx={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 2 }}
                />
                {onRemoveExistingImage && (
                  <IconButton
                    size="small"
                    onClick={() => onRemoveExistingImage(image.id)}
                    sx={{ position: 'absolute', top: -8, right: -8, bgcolor: 'background.paper', boxShadow: 1 }}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                )}
              </Box>
            ))}
          </Box>
        )}

        {files.length > 0 && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
            {files.map((file, index) => (
              <Box key={`${file.name}-${index}`} sx={{ position: 'relative', width: 96, height: 96 }}>
                <Box
                  component="img"
                  src={URL.createObjectURL(file)}
                  alt=""
                  sx={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 2 }}
                />
                <IconButton
                  size="small"
                  onClick={() => handleRemoveNewFile(index)}
                  sx={{ position: 'absolute', top: -8, right: -8, bgcolor: 'background.paper', boxShadow: 1 }}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Box>
            ))}
          </Box>
        )}

        <Button component="label" variant="outlined" startIcon={<AddPhotoAlternateIcon />} size="small">
          사진 선택
          <input type="file" accept="image/*" multiple hidden onChange={handleFileChange} />
        </Button>
      </Box>

      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
        <Button type="submit" variant="contained" disabled={isSubmitting}>
          {submitLabel}
        </Button>
      </Box>
    </Box>
  );
}

export default PostForm;
