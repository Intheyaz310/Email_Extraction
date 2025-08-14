import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#181C24',
      paper: '#232936',
    },
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#00bcd4',
    },
    text: {
      primary: '#fff',
      secondary: '#b0b8c1',
    },
  },
  shape: {
    borderRadius: 16,
  },
  typography: {
    fontFamily: 'Inter, Roboto, Arial, sans-serif',
    h6: { fontWeight: 700 },
  },
  shadows: [
    'none',
    '0px 2px 8px rgba(0,0,0,0.12)',
    ...Array(23).fill('0px 2px 8px rgba(0,0,0,0.12)')
  ],
});

export default theme; 