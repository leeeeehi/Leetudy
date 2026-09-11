import { createTheme } from '@mui/material/styles';

// Leetudy 파스텔 자연색 팔레트 (나무/잎/하늘) + 친근한 분위기
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#7FAE87',
      light: '#A9CDB0',
      dark: '#5C8C67',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#8FBBDB',
      light: '#BBDAF0',
      dark: '#5E8FB3',
      contrastText: '#FFFFFF',
    },
    warning: {
      main: '#D6A96D',
      light: '#EAC79A',
      dark: '#B4854A',
    },
    background: {
      default: '#FAF7F0',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#3F3A32',
      secondary: '#6F6A5F',
    },
  },
  shape: {
    borderRadius: 16,
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontSize: '2.125rem', fontWeight: 700 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 700 },
    button: { fontWeight: 600, textTransform: 'none' },
  },
  spacing: 8,
  components: {
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 12 },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: 'none' },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: { borderRadius: 16 },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 8 },
      },
    },
  },
});

export default theme;
