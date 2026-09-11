import { useEffect, useState } from 'react';
import { Link as RouterLink, useSearchParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Pagination from '@mui/material/Pagination';
import Alert from '@mui/material/Alert';

import PageContainer from '../components/common/PageContainer';
import PostCard from '../components/post/PostCard';
import { useAuth } from '../hooks/useAuth';
import { fetchPosts, fetchCategories, fetchLikedPostIds, likePost, unlikePost } from '../lib/posts';
import { fetchRecentCommentsByPostIds } from '../lib/comments';

const PAGE_SIZE = 10;

/**
 * 게시물 목록 페이지 (검색, 카테고리 필터, 페이지네이션)
 */
function PostListPage() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchInput, setSearchInput] = useState(searchParams.get('q') ?? '');
  const [categories, setCategories] = useState([]);
  const [posts, setPosts] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [recentCommentsByPostId, setRecentCommentsByPostId] = useState({});
  const [likedPostIds, setLikedPostIds] = useState(new Set());
  const [errorMessage, setErrorMessage] = useState('');

  const search = searchParams.get('q') ?? '';
  const categoryId = searchParams.get('category') ? Number(searchParams.get('category')) : null;
  const page = searchParams.get('page') ? Number(searchParams.get('page')) : 0;

  useEffect(() => {
    fetchCategories().then(setCategories).catch((error) => setErrorMessage(error.message));
  }, []);

  useEffect(() => {
    let isActive = true;
    fetchPosts({ search, categoryId, page })
      .then(async ({ posts: fetchedPosts, totalCount: count }) => {
        if (!isActive) return;
        setPosts(fetchedPosts);
        setTotalCount(count);

        const postIds = fetchedPosts.map((p) => p.id);
        const [recentComments, likedIds] = await Promise.all([
          fetchRecentCommentsByPostIds(postIds),
          user ? fetchLikedPostIds(user.id, postIds) : Promise.resolve([]),
        ]);
        if (!isActive) return;
        setRecentCommentsByPostId(recentComments);
        setLikedPostIds(new Set(likedIds));
      })
      .catch((error) => setErrorMessage(error.message));
    return () => {
      isActive = false;
    };
  }, [search, categoryId, page, user]);

  const updateParams = (updates) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === undefined || value === '') {
        next.delete(key);
      } else {
        next.set(key, String(value));
      }
    });
    setSearchParams(next);
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    updateParams({ q: searchInput, page: null });
  };

  const handleCategoryClick = (id) => {
    updateParams({ category: categoryId === id ? null : id, page: null });
  };

  const handleToggleLike = async (postId) => {
    if (!user) return;
    const isLiked = likedPostIds.has(postId);
    try {
      if (isLiked) {
        await unlikePost(postId, user.id);
      } else {
        await likePost(postId, user.id);
      }
      setLikedPostIds((prev) => {
        const next = new Set(prev);
        if (isLiked) next.delete(postId);
        else next.add(postId);
        return next;
      });
      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, like_count: p.like_count + (isLiked ? -1 : 1) } : p)),
      );
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  const pageCount = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  return (
    <PageContainer maxWidth="lg">
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mb: 3, alignItems: { sm: 'center' } }}>
        <Box component="form" onSubmit={handleSearchSubmit} sx={{ flexGrow: 1 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="제목, 내용, 작성자로 검색"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              },
            }}
          />
        </Box>
        {user && (
          <Button component={RouterLink} to="/write" variant="contained">
            글쓰기
          </Button>
        )}
      </Box>

      <Stack direction="row" spacing={1} sx={{ mb: 3, flexWrap: 'wrap', rowGap: 1 }}>
        <Chip
          label="전체"
          color={!categoryId ? 'primary' : 'default'}
          variant={!categoryId ? 'filled' : 'outlined'}
          onClick={() => handleCategoryClick(null)}
        />
        {categories.map((category) => (
          <Chip
            key={category.id}
            label={category.name}
            color={categoryId === category.id ? 'primary' : 'default'}
            variant={categoryId === category.id ? 'filled' : 'outlined'}
            onClick={() => handleCategoryClick(category.id)}
          />
        ))}
      </Stack>

      {errorMessage && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setErrorMessage('')}>
          {errorMessage}
        </Alert>
      )}

      {posts.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 6 }}>
          아직 게시물이 없어요.
        </Typography>
      ) : (
        <Grid container spacing={2}>
          {posts.map((post) => (
            <Grid key={post.id} size={{ xs: 12, sm: 6, md: 4 }}>
              <PostCard
                post={post}
                recentComments={recentCommentsByPostId[post.id] ?? []}
                isLiked={likedPostIds.has(post.id)}
                onToggleLike={handleToggleLike}
              />
            </Grid>
          ))}
        </Grid>
      )}

      {pageCount > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination
            count={pageCount}
            page={page + 1}
            onChange={(_event, value) => updateParams({ page: value - 1 || null })}
            color="primary"
          />
        </Box>
      )}
    </PageContainer>
  );
}

export default PostListPage;
