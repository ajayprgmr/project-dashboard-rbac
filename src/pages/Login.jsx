import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  FormControl,
  FormHelperText,
  FormLabel,
  IconButton,
  InputAdornment,
  Link,
  OutlinedInput,
  Paper,
  Typography,
} from '@mui/material';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/useRedux';
import { loginUser } from '../features/auth';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

const validationSchema = Yup.object({
  email: Yup.string().email('Invalid email').required('Email is required'),
  password: Yup.string().min(4, 'Password must be at least 4 characters').required('Password is required'),
});

const LoginPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const auth = useAppSelector((state) => state.auth);
  const from = location.state?.from?.pathname || '/projects';
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (auth.user) {
      navigate(from, { replace: true });
    }
  }, [auth.user, from, navigate]);

  return (
    <Container component="main" maxWidth="sm" sx={{ display: 'flex', alignItems: 'center', minHeight: '100vh' }}>
      <Paper elevation={4} sx={{ p: 4, width: '100%' }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight={600} textAlign='center'>
          Project Control Center
        </Typography>
        <Formik
          initialValues={{ email: '', password: '' }}
          validationSchema={validationSchema}
          onSubmit={async (values, { setSubmitting }) => {
            try {
              await dispatch(loginUser(values)).unwrap();
            } catch (error) {
              console.error(error);
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({ handleSubmit, handleChange, handleBlur, touched, errors, values, isSubmitting }) => {
            const emailError = touched.email && errors.email;
            const passwordError = touched.password && errors.password;

            return (
              <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <FormControl fullWidth error={Boolean(emailError)}>
                  <FormLabel>Email</FormLabel>
                  <OutlinedInput
                    name="email"
                    value={values.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="name@fixl.test"
                    autoComplete="email"
                    notched={false}
                    sx={{ mt: 1 }}
                  />
                  <FormHelperText sx={{ color: emailError ? 'error.main' : 'text.secondary' }}>
                    {emailError || 'Use e.g. aarav.sharma@fixl.test'}
                  </FormHelperText>
                </FormControl>

                <FormControl fullWidth error={Boolean(passwordError)}>
                  <FormLabel>Password</FormLabel>
                  <OutlinedInput
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={values.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    notched={false}
                    sx={{ mt: 1 }}
                    endAdornment={
                      <InputAdornment position="end">
                        <IconButton
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                          onClick={() => setShowPassword((prev) => !prev)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityIcon /> : <VisibilityOffIcon />}
                        </IconButton>
                      </InputAdornment>
                    }
                  />
                  <FormHelperText sx={{ color: passwordError ? 'error.main' : 'text.secondary' }}>
                    {passwordError || 'Try admin123, manager123, dev123...'}
                  </FormHelperText>
                </FormControl>

                {auth.error && <Alert severity="error">{auth.error}</Alert>}
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Signing in...' : 'Sign in'}
                </Button>
                <Typography variant="caption" color="text.secondary">
                  Hint: Admins can impersonate others via the Admin panel.
                </Typography>
              </Box>
            );
          }}
        </Formik>
        <Box sx={{ mt: 4 }}>
          <Typography variant="body2" color="text.secondary">
            Need demo credentials?
          </Typography>
          <Link component="button" onClick={() => navigate('/login?help=true')} variant="body2">
            View README for mock user list
          </Link>
        </Box>
      </Paper>
    </Container>
  );
};

export default LoginPage;
