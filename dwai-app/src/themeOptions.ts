import { ThemeOptions } from '@mui/material/styles';

export const themeOptions: ThemeOptions = {
  components: {
    MuiButtonBase: {
      defaultProps: {
        disableRipple: true,
      },
    },
  },
  palette: {
    mode: 'light',
    primary: {
      main: '#f0d075',
    },
    secondary: {
      main: '#a7be26',
    },
  },
  shape: {
    borderRadius: 0,
  },
  spacing: 5,
  typography: {
    body1: {
      fontSize: '1rem',
    },
    body2: {
      fontSize: '0.8rem',
    },
    button: {
      fontSize: '1rem',
      fontWeight: 600,
    },
    caption: {
      fontSize: '0.8rem',
    },
    fontFamily: 'Gideon Roman',
    fontSize: 15,
    fontWeightLight: 300,
    h1: {
      fontSize: '6rem',
    },
    h3: {
      fontSize: '3rem',
    },
    h2: {
      fontSize: '4rem',
    },
    h4: {
      fontSize: '2rem',
    },
    h5: {
      fontSize: '1.5rem',
    },
    h6: {
      fontSize: '1.2rem',
    },
    overline: {
      fontSize: '0.8rem',
    },
  },
};