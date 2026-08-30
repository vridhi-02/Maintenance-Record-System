import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import EquipmentMaintenance from '../components/EquipmentMaintenance';
import MaintenanceRecord from '../components/MaintenanceRecord';
import WaterTesting from '../components/WaterTesting';

import {
  Box,
  Typography,
  Button,
  Divider,
  Snackbar,
  Alert,
  IconButton,
  Tooltip,
  Stack,
} from '@mui/material';

import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';
import ConstructionIcon from '@mui/icons-material/Construction';
import HistoryEduIcon from '@mui/icons-material/HistoryEdu';
import ScienceIcon from '@mui/icons-material/Science';

import { tokens, fonts } from '../components/theme';
import '../App.css';

function AdminDashboard() {
  const [activeSection, setActiveSection] = useState('equipment');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    setSnackbarOpen(true);
    setTimeout(() => navigate('/login'), 2000);
  };

  const handleSectionClick = (section) => setActiveSection(section);
  const handleCloseSnackbar = (_, reason) => {
    if (reason === 'clickaway') return;
    setSnackbarOpen(false);
  };

  const sidebarItems = [
    {
      key: 'equipment',
      label: 'Equipment Maintenance (PM & CM)',
      subtitle: 'Log preventive and corrective maintenance work',
      icon: <ConstructionIcon fontSize="small" />,
    },
    {
      key: 'record',
      label: 'Maintenance Record',
      subtitle: 'Review past maintenance entries',
      icon: <HistoryEduIcon fontSize="small" />,
    },
    {
      key: 'water testing',
      label: 'Water Testing',
      subtitle: 'Log and review water quality checks',
      icon: <ScienceIcon fontSize="small" />,
    },
  ];

  const activeItem = sidebarItems.find((i) => i.key === activeSection);
  const sidebarWidth = sidebarOpen ? 264 : 76;

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: tokens.paper }}>
      {/* Sidebar — light surface, amber accent on the active item */}
      <Box
        sx={{
          width: sidebarWidth,
          flexShrink: 0,
          position: 'sticky',
          top: 0,
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          bgcolor: tokens.card,
          borderRight: `1px solid ${tokens.line}`,
          transition: 'width 0.25s ease',
          overflowX: 'hidden',
          py: 2.5,
        }}
      >
        <Box>
          {/* Top: Logo + Toggle */}
          <Box sx={{ px: sidebarOpen ? 2.5 : 0 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: sidebarOpen ? 'space-between' : 'center',
              }}
            >
              {sidebarOpen && (
                <Stack direction="row" spacing={1.25} alignItems="center">
                  <Box component="img" src="/logo.jpeg" alt="Logo" className="sidebar-logo" />
                  <Typography sx={{ fontFamily: fonts.display, fontWeight: 700, fontSize: '1rem', color: tokens.ink }}>
                    Maintenance
                  </Typography>
                </Stack>
              )}
              <IconButton onClick={() => setSidebarOpen(!sidebarOpen)} size="small" sx={{ color: tokens.muted }}>
                <MenuIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>

          <Divider sx={{ borderColor: tokens.line, mx: sidebarOpen ? 2.5 : 1.5, my: 2 }} />

          {/* Menu */}
          <Stack spacing={0.5} sx={{ px: 1.25 }}>
            {sidebarItems.map((item) => {
              const active = activeSection === item.key;
              const button = (
                <Box
                  key={item.key}
                  onClick={() => handleSectionClick(item.key)}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    cursor: 'pointer',
                    borderRadius: '10px',
                    px: sidebarOpen ? 1.5 : 0,
                    py: 1.1,
                    justifyContent: sidebarOpen ? 'flex-start' : 'center',
                    color: active ? tokens.amberDark : tokens.muted,
                    bgcolor: active ? tokens.amberTint : 'transparent',
                    fontWeight: active ? 600 : 500,
                    transition: 'all 0.15s ease',
                    '&:hover': { bgcolor: tokens.amberTint, color: tokens.amberDark },
                  }}
                >
                  <Box sx={{ display: 'flex' }}>{item.icon}</Box>
                  {sidebarOpen && <Typography sx={{ fontSize: '0.88rem' }}>{item.label}</Typography>}
                </Box>
              );
              return sidebarOpen ? (
                button
              ) : (
                <Tooltip key={item.key} title={item.label} placement="right">
                  {button}
                </Tooltip>
              );
            })}
          </Stack>
        </Box>

        {/* Logout */}
        <Box sx={{ px: sidebarOpen ? 2 : 1.5 }}>
          <Divider sx={{ borderColor: tokens.line, mb: 1.5 }} />
          <Button
            onClick={handleLogout}
            fullWidth
            variant="outlined"
            startIcon={sidebarOpen ? <LogoutIcon fontSize="small" /> : null}
            sx={{
              minWidth: 0,
              color: tokens.danger,
              borderColor: tokens.line,
              justifyContent: sidebarOpen ? 'flex-start' : 'center',
              px: sidebarOpen ? 1.5 : 0,
              '&:hover': { bgcolor: tokens.dangerTint, borderColor: tokens.danger },
            }}
          >
            {sidebarOpen ? 'Log out' : <LogoutIcon fontSize="small" />}
          </Button>
        </Box>
      </Box>

      {/* Main Content — its own scroll container, since html/body/#root
          have overflow:hidden (see App.css) to keep the sidebar fixed. */}
      <Box sx={{ flex: 1, minWidth: 0, height: '100vh', overflowY: 'auto' }}>
        <Box
          sx={{
            position: 'sticky',
            top: 0,
            zIndex: 5,
            bgcolor: tokens.paper,
            borderBottom: `1px solid ${tokens.line}`,
            px: { xs: 3, md: 5 },
            py: 2.25,
          }}
        >
          <Typography variant="h5" sx={{ color: tokens.ink }}>
            {activeItem?.label}
          </Typography>
          <Typography variant="body2" sx={{ color: tokens.muted, mt: 0.25 }}>
            {activeItem?.subtitle}
          </Typography>
        </Box>

        <Box sx={{ px: { xs: 3, md: 5 }, py: 4 }}>
          {activeSection === 'equipment' && <EquipmentMaintenance />}
          {activeSection === 'record' && <MaintenanceRecord />}
          {activeSection === 'water testing' && <WaterTesting />}
        </Box>
      </Box>

      {/* Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={1500}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
          Successfully logged out!
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default AdminDashboard;