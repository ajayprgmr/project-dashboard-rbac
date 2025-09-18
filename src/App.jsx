import { useEffect, useMemo } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { CssBaseline, useMediaQuery } from '@mui/material';
import { createTheme, ThemeProvider, StyledEngineProvider } from '@mui/material/styles';
import AppRouter from './routes/AppRouter';
import { useAppDispatch, useAppSelector } from './hooks/useRedux';
import { setTheme } from './features/ui/uiSlice';
import NotificationCenter from './components/common/feedback/NotificationCenter';

const paletteTokens = {
  light: {
    primary: {
      main: '#0066ff',
    },
    secondary: {
      main: '#6c63ff',
    },
    background: {
      default: '#f5f7fb',
      paper: '#ffffff',
    },
  },
  dark: {
    primary: {
      main: '#90caf9',
    },
    background: {
      default: '#0c111f',
      paper: '#151a2c',
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
              marginLeft:'unset'
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
            padding:0,
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
