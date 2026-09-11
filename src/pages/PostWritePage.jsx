import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';

import PageContainer from '../components/common/PageContainer';
import PostForm from '../components/post/PostForm';
import { useAuth } from '../hooks/useAuth';
import { fetchCategories, fetchPostById, createPost, updatePost, deletePostImage } from '../lib/posts';
import { uploadPostImages } from '../lib/storage';

/**
 * 게시글 작성/수정 페이지 (postId 유무로 모드 결정)
 */
function PostWritePage() {
  const { postId } = useParams();
  const isEditMode = Boolean(postId);
  const { user } = useAuth();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [post, setPost] = useState(null);
  const [existingImages, setExistingImages] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(isEditMode);

  useEffect(() => {
    fetchCategories().then(setCategories).catch((error) => setErrorMessage(error.message));
  }, []);

  useEffect(() => {
    if (!isEditMode) return;
    fetchPostById(postId)
      .then((data) => {
        if (data.user_id !== user?.id) {
          navigate(`/posts/${postId}`, { replace: true });
          return;
        }
        setPost(data);
        setExistingImages(data.images ?? []);
      })
      .catch((error) => setErrorMessage(error.message))
      .finally(() => setIsLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId, isEditMode]);

  const handleRemoveExistingImage = async (imageId) => {
    try {
      await deletePostImage(imageId);
      setExistingImages((prev) => prev.filter((image) => image.id !== imageId));
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  const handleSubmit = async ({ categoryId, title, content, memo, files }) => {
    const imageUrls = files.length > 0 ? await uploadPostImages(files, user.id) : [];

    if (isEditMode) {
      await updatePost(postId, { category_id: categoryId, title, content, memo }, imageUrls);
      navigate(`/posts/${postId}`);
    } else {
      const created = await createPost({ userId: user.id, categoryId, title, content, memo, imageUrls });
      navigate(`/posts/${created.id}`);
    }
  };

  if (isLoading) {
    return (
      <PageContainer maxWidth="md">
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress color="primary" />
        </Box>
      </PageContainer>
    );
  }

  return (
    <PageContainer maxWidth="md">
      <Paper variant="outlined" sx={{ p: { xs: 2.5, md: 4 } }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
          {isEditMode ? '게시글 수정' : '게시글 작성'}
        </Typography>

        {errorMessage && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setErrorMessage('')}>
            {errorMessage}
          </Alert>
        )}

        <PostForm
          categories={categories}
          initialValues={
            isEditMode && post
              ? { categoryId: post.category_id, title: post.title, content: post.content, memo: post.memo }
              : undefined
          }
          existingImages={existingImages}
          onRemoveExistingImage={isEditMode ? handleRemoveExistingImage : undefined}
          onSubmit={handleSubmit}
          submitLabel={isEditMode ? '수정' : '등록'}
        />
      </Paper>
    </PageContainer>
  );
}

export default PostWritePage;
