import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  Paper,
  InputAdornment,
  IconButton,
  CircularProgress,
} from '@mui/material';

import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:8081/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Invalid username or password');
        setLoading(false);
        return;
      }

      localStorage.setItem('loggedInUser', JSON.stringify(data));

      if (data.role === 'admin') {
        navigate('/admin-dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      console.error(err);
      setError('Unable to connect to the server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        background: '#f5f7fb',
        overflow: 'hidden',
      }}
    >
      {/* ================= LEFT SIDE ================= */}
      <Box
        sx={{
          flex: 1,
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative',
          px: 6,
          color: '#fff',
          background:
            'linear-gradient(145deg, #5b21b6 0%, #7c3aed 45%, #a855f7 100%)',
          overflow: 'hidden',
        }}
      >
        {/* Decorative circles */}
        <Box
          sx={{
            position: 'absolute',
            width: 400,
            height: 400,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.08)',
            top: -150,
            left: -150,
          }}
        />

        <Box
          sx={{
            position: 'absolute',
            width: 300,
            height: 300,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.06)',
            bottom: -100,
            right: -100,
          }}
        />

        <Box
          sx={{
            position: 'relative',
            zIndex: 2,
            textAlign: 'center',
            maxWidth: 500,
          }}
        >
          {/* Logo */}
          <Box
            sx={{
              width: 130,
              height: 130,
              margin: '0 auto 25px',
              borderRadius: '50%',
              background: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 2,
              boxShadow: '0 15px 40px rgba(0,0,0,0.2)',
            }}
          >
            <img
              src="/logo.jpeg"
              alt="Govinda's Srinathji Bhavan"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                borderRadius: '50%',
              }}
            />
          </Box>

          <Typography
            sx={{
              fontSize: { md: '32px', lg: '40px' },
              fontWeight: 700,
              lineHeight: 1.2,
              mb: 2,
            }}
          >
            Govinda's
            <br />
            Srinathji Bhavan
          </Typography>

          <Typography
            sx={{
              fontSize: 17,
              opacity: 0.9,
              lineHeight: 1.7,
            }}
          >
            Welcome to the management portal.
            <br />
            Please sign in to continue.
          </Typography>

          <Box
            sx={{
              width: 60,
              height: 4,
              borderRadius: 5,
              background: '#fff',
              margin: '30px auto 0',
            }}
          />
        </Box>
      </Box>

      {/* ================= RIGHT SIDE ================= */}
      <Box
        sx={{
          width: { xs: '100%', md: '50%', lg: '45%' },
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          px: { xs: 3, sm: 5, md: 7 },
          py: 5,
          background: '#ffffff',
        }}
      >
        <Paper
          component="form"
          onSubmit={handleLogin}
          elevation={0}
          sx={{
            width: '100%',
            maxWidth: 430,
            background: '#fff',
          }}
        >
          {/* Mobile Logo */}
          <Box
            sx={{
              display: { xs: 'flex', md: 'none' },
              justifyContent: 'center',
              mb: 3,
            }}
          >
            <Box
              sx={{
                width: 85,
                height: 85,
                borderRadius: '50%',
                padding: 1,
                boxShadow: '0 5px 20px rgba(0,0,0,0.12)',
              }}
            >
              <img
                src="/logo.jpeg"
                alt="Logo"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  borderRadius: '50%',
                }}
              />
            </Box>
          </Box>

          <Typography
            sx={{
              fontSize: 30,
              fontWeight: 700,
              color: '#171717',
              mb: 1,
            }}
          >
            Welcome Back
          </Typography>

          <Typography
            sx={{
              color: '#737373',
              fontSize: 15,
              mb: 4,
            }}
          >
            Sign in to access your account
          </Typography>

          {/* Username */}
          <Typography
            sx={{
              fontSize: 14,
              fontWeight: 600,
              color: '#404040',
              mb: 1,
            }}
          >
            Username
          </Typography>

          <TextField
            fullWidth
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            placeholder="Enter your username"
            autoComplete="username"
            variant="outlined"
            sx={{
              mb: 2.5,
              '& .MuiOutlinedInput-root': {
                borderRadius: '10px',
                backgroundColor: '#fafafa',
                height: 52,
                '& fieldset': {
                  borderColor: '#e5e7eb',
                },
                '&:hover fieldset': {
                  borderColor: '#7c3aed',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#7c3aed',
                  borderWidth: 2,
                },
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PersonOutlineIcon
                    sx={{
                      color: '#9ca3af',
                    }}
                  />
                </InputAdornment>
              ),
            }}
          />

          {/* Password */}
          <Typography
            sx={{
              fontSize: 14,
              fontWeight: 600,
              color: '#404040',
              mb: 1,
            }}
          >
            Password
          </Typography>

          <TextField
            fullWidth
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Enter your password"
            autoComplete="current-password"
            variant="outlined"
            sx={{
              mb: 2,
              '& .MuiOutlinedInput-root': {
                borderRadius: '10px',
                backgroundColor: '#fafafa',
                height: 52,
                '& fieldset': {
                  borderColor: '#e5e7eb',
                },
                '&:hover fieldset': {
                  borderColor: '#7c3aed',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#7c3aed',
                  borderWidth: 2,
                },
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockOutlinedIcon
                    sx={{
                      color: '#9ca3af',
                    }}
                  />
                </InputAdornment>
              ),

              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                  >
                    {showPassword ? (
                      <VisibilityOff />
                    ) : (
                      <Visibility />
                    )}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          {/* Error */}
          {error && (
            <Alert
              severity="error"
              sx={{
                mb: 2,
                borderRadius: '10px',
              }}
            >
              {error}
            </Alert>
          )}

          {/* Login Button */}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading}
            sx={{
              height: 52,
              mt: 1,
              borderRadius: '10px',
              textTransform: 'none',
              fontSize: 16,
              fontWeight: 600,
              background:
                'linear-gradient(135deg, #6d28d9 0%, #9333ea 100%)',
              boxShadow:
                '0 8px 20px rgba(124,58,237,0.25)',
              '&:hover': {
                background:
                  'linear-gradient(135deg, #5b21b6 0%, #7e22ce 100%)',
                boxShadow:
                  '0 10px 25px rgba(124,58,237,0.35)',
              },
            }}
          >
            {loading ? (
              <CircularProgress
                size={24}
                sx={{ color: '#fff' }}
              />
            ) : (
              'Sign In'
            )}
          </Button>

          {/* Footer */}
          <Typography
            sx={{
              textAlign: 'center',
              color: '#9ca3af',
              fontSize: 13,
              mt: 5,
            }}
          >
            © {new Date().getFullYear()} Govinda's Srinathji Bhavan
          </Typography>
        </Paper>
      </Box>
    </Box>
  );
}

export default Login;