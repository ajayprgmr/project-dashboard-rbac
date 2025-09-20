import { useEffect, useMemo } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { CssBaseline, useMediaQuery } from '@mui/material';
import { createTheme, ThemeProvider, StyledEngineProvider } from '@mui/material/styles';
import AppRouter from './routes/AppRouter';
import { useAppDispatch, useAppSelector } from './hooks/useRedux';
import { setTheme } from './features/ui';
import NotificationCenter from './components/common/feedback/NotificationCenter';

const paletteTokens = {
  light: {
    primary: {
      main: '#4c8bf5',
      light: '#79a7ff',
      dark: '#2f6fd1',
    },
    secondary: {
      main: '#51bfae',
      light: '#7ed4c5',
      dark: '#3c8f82',
    },
    background: {
      default: '#f1f4f9',
      paper: '#ffffff',
    },
    divider: '#d7dee8',
    text: {
      primary: '#1f2937',
      secondary: '#4b5563',
    },
  },
  dark: {
    primary: {
      main: '#8bb4ff',
      light: '#adcaff',
      dark: '#5e8de0',
    },
    secondary: {
      main: '#5ac7b7',
      light: '#78d7c7',
      dark: '#3f9286',
    },
    background: {
      default: '#0f172a',
      paper: '#131c31',
    },
    divider: '#1e293b',
    text: {
      primary: '#e2e8f0',
      secondary: '#94a3b8',
    },
  },
};

function App() {
  const dispatch = useAppDispatch();
  const themeMode = useAppSelector((state) => state.ui.theme) || 'light';
  const prefersDark = useMediaQuery('(prefers-color-scheme: dark)');

  useEffect(() => {
    if (!themeMode && prefersDark) {
      dispatch(setTheme('dark'));
    }
  }, [dispatch, prefersDark, themeMode]);

  const theme = useMemo(() => {
    const palette = themeMode === 'dark' ? paletteTokens.dark : paletteTokens.light;
    const baseTheme = createTheme({
      palette: {
        mode: themeMode,
        ...palette,
      },
      shape: {
        borderRadius: 5,
      },
      typography: {
        fontFamily: 'Inter, Roboto, system-ui, -apple-system, BlinkMacSystemFont',
      },
      components: {
        MuiButton: {
          styleOverrides: {
            root: {
              textTransform: 'none',
              fontWeight: 600,
            },
          },
        },
        MuiChip: {
          styleOverrides: {
            root: {
              borderRadius: 5,
            },
          },
        },
        FormHelperText: {
          styleOverrides: {
            root: {
              marginLeft: 'unset'
            }
          }
        }
      },
    });

    baseTheme.components = {
      ...baseTheme.components,
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            backgroundColor: baseTheme.palette.background.paper,
            transition: 'background-color 0.2s ease',
            '&:hover': {
              backgroundColor: baseTheme.palette.background.paper,
            },
            '&.Mui-focused': {
              backgroundColor: baseTheme.palette.background.paper,
            },
          },
          input: {
            '&:-webkit-autofill': {
              WebkitBoxShadow: `0 0 0 1000px ${baseTheme.palette.background.paper} inset`,
              WebkitTextFillColor: baseTheme.palette.text.primary,
              caretColor: baseTheme.palette.text.primary,
            },
            '&:-webkit-autofill:hover': {
              WebkitBoxShadow: `0 0 0 1000px ${baseTheme.palette.background.paper} inset`,
              WebkitTextFillColor: baseTheme.palette.text.primary,
            },
            '&:-webkit-autofill:focus': {
              WebkitBoxShadow: `0 0 0 1000px ${baseTheme.palette.background.paper} inset`,
              WebkitTextFillColor: baseTheme.palette.text.primary,
            },
          },
        },
      },
    };

    baseTheme.components = {
      ...baseTheme.components,
      MuiFormHelperText: {
        styleOverrides: {
          root: {
            marginLeft: 0,
          },
        },
      },
      MuiCssBaseline: {
        styleOverrides: {
          'html, body': {
            height: '100%',
            margin: 0,
            padding: 0,
            backgroundColor: baseTheme.palette.background.default,
            overscrollBehavior: 'none',
          },
        },
      },
    };

    return baseTheme;
  }, [themeMode]);

  useEffect(() => {
    document.body.dataset.theme = themeMode;
    document.documentElement.dataset.theme = themeMode;
    document.documentElement.style.overscrollBehavior = 'none';
    document.body.style.overscrollBehavior = 'none';
    document.body.style.overflowX = 'hidden';

    return () => {
      document.body.dataset.theme = '';
      document.documentElement.dataset.theme = '';
      document.documentElement.style.overscrollBehavior = '';
      document.body.style.overscrollBehavior = '';
      document.body.style.overflowX = '';
    };
  }, [themeMode]);

  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <AppRouter />
          <NotificationCenter />
        </BrowserRouter>
      </ThemeProvider>
    </StyledEngineProvider>
  );
}

export default App;
