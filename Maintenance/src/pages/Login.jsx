import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  Paper,
} from '@mui/material';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:8081/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.error || 'Login failed');
        return;
      }

      localStorage.setItem('loggedInUser', JSON.stringify(data));

      if (data.role === 'admin') {
        navigate('/admin-dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      console.error(err); // Optional for debugging
      setError(err.message || 'Server error. Please try again later.');
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(to right, #ffecd2 0%, #fcb69f 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        px: 2,
      }}
    >
      {/* Logo + Heading */}
      <Box sx={{ textAlign: 'center', mb: 2 }}>
        <img
          src="/logo.jpeg"
          alt="Logo"
          style={{ width: '20%', height: '20%' }}
        />
        <Typography
          variant="h4"
          sx={{
            fontFamily: 'Open Sans',
            fontWeight: 'bold',
            mt: 1,
            color: '#432E54',
            fontSize: 40,
          }}
        >
          Govinda's Srinathji Bhavan
        </Typography>
      </Box>

      {/* Form Box */}
      <Paper
        elevation={3}
        component="form"
        onSubmit={handleLogin}
        sx={{
          p: 4,
          width: '100%',
          maxWidth: 350,
          bgcolor: '#FFF5EE',
          borderRadius: '12px',
          boxShadow: '0 6px 18px rgba(0, 0, 0, 0.1)',
        }}
      >
        <Typography
          variant="h5"
          sx={{ textAlign: 'center', mb: 3, color: '#432E54' }}
        >
          Login In
        </Typography>

        <TextField
          variant="outlined"
          fullWidth
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          margin="normal"
          placeholder="Enter your username"
        />
        <TextField
          type="password"
          variant="outlined"
          fullWidth
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          margin="normal"
          placeholder="Enter your password"
        />

        {error && (
          <Alert severity="error" sx={{ mt: 2, mb: 1, fontSize: '0.9rem' }}>
            {error}
          </Alert>
        )}

        <Button
          type="submit"
          variant="contained"
          fullWidth
          sx={{
            mt: 2,
            backgroundColor: '#ef4444',
            color: 'white',
            fontWeight: 500,
            fontSize: '1rem',
            textTransform: 'none',
            borderRadius: '10px',
            '&:hover': {
              backgroundColor: '#c0392b',
            },
          }}
        >
          Login In
        </Button>
      </Paper>
    </Box>
  );
}

export default Login;
