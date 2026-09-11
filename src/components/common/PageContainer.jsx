import Box from '@mui/material/Box';
import Container from '@mui/material/Container';

/**
 * 페이지 공통 중앙 정렬 레이아웃 (헤더 아래 영역을 채우며 콘텐츠를 중앙 정렬)
 *
 * Props:
 * @param {'xs'|'sm'|'md'|'lg'|'xl'} maxWidth - Container 최대 너비 [Optional, 기본값: 'md']
 * @param {React.ReactNode} children - 페이지 컨텐츠 [Required]
 *
 * Example usage:
 * <PageContainer maxWidth="sm"><LoginForm /></PageContainer>
 */
function PageContainer({ maxWidth = 'md', children }) {
  return (
    <Box sx={{ width: '100%', flexGrow: 1, display: 'flex', justifyContent: 'center', py: { xs: 2, md: 4 } }}>
      <Container maxWidth={maxWidth} sx={{ px: { xs: 2, md: 3 }, width: '100%' }}>
        {children}
      </Container>
    </Box>
  );
}

export default PageContainer;
