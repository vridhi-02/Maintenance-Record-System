import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import EquipmentMaintenance from '../components/EquipmentMaintenance';
import MaintenanceRecord from '../components/MaintenanceRecord';
import Master from '../components/Master';
import EquipmentMaster from '../components/EquipmentMaster';
import EquipmentMasterRecord from '../components/EquipmentMasterRecord';
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
} from '@mui/material';

import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';
import ConstructionIcon from '@mui/icons-material/Construction';
import HistoryEduIcon from '@mui/icons-material/HistoryEdu';
import CategoryIcon from '@mui/icons-material/Category';
import InventoryIcon from '@mui/icons-material/Inventory';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';

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
      icon: <ConstructionIcon fontSize="small" />,
    },
    {
      key: 'record',
      label: 'Maintenance Record',
      icon: <HistoryEduIcon fontSize="small" />,
    },
    {
      key: 'master',
      label: 'Section and Equipment Master',
      icon: <CategoryIcon fontSize="small" />,
    },
    {
      key: 'equipment master',
      label: 'Equipment Master',
      icon: <InventoryIcon fontSize="small" />,
    },
    {
      key: 'equipment master record',
      label: 'Equipment Master Record',
      icon: <AssignmentTurnedInIcon fontSize="small" />,
    },
     {
      key: 'water testing',
      label: 'Water Testing',
      icon: <AssignmentTurnedInIcon fontSize="small" />,
    },

  ];

  return (
    <Box className="dashboard-wrapper">
      <Box
        className="sidebar"
        sx={{
          width: sidebarOpen ? '240px' : '70px',
          transition: 'width 0.3s ease',
          alignItems: sidebarOpen ? 'flex-start' : 'center',
        }}
      >
        <Box sx={{ width: '100%' }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: sidebarOpen ? 'space-between' : 'center',
            }}
          >
            <img src="/logo.jpeg" alt="Logo" className="sidebar-logo" />
            <IconButton onClick={() => setSidebarOpen(!sidebarOpen)}>
              <MenuIcon sx={{ color: 'white' }} />
            </IconButton>
          </Box>

          <Divider sx={{ backgroundColor: '#bdc3c7', my: 2 }} />

          {/* Sidebar Menu */}
          <Box className="sidebar-menu">
            {sidebarItems.map((item) => (
              <Tooltip
                key={item.key}
                title={sidebarOpen ? '' : item.label}
                placement="right"
              >
                <Typography
                  variant="h6"
                  onClick={() => handleSectionClick(item.key)}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    mb: 1,
                    cursor: 'pointer',
                    color: activeSection === item.key ? '#FAB12F' : '#fff',
                    '&:hover': { color: '#FAB12F' },
                  }}
                >
                  {item.icon}
                  {sidebarOpen && item.label}
                </Typography>
              </Tooltip>
            ))}
          </Box>
        </Box>

        {/* Logout */}
        <Button
          onClick={handleLogout}
          variant="contained"
          size="small"
          fullWidth={sidebarOpen}
          startIcon={<LogoutIcon />}
          sx={{
            backgroundColor: '#e74c3c',
            color: 'white',
            borderRadius: '8px',
            textTransform: 'none',
            fontSize: '14px',
            fontWeight: 500,
            justifyContent: sidebarOpen ? 'flex-start' : 'center',
            px: sidebarOpen ? 2 : 0,
            '&:hover': { backgroundColor: '#c0392b' },
            mt: 2,
          }}
        >
          {sidebarOpen && 'Logout'}
        </Button>
      </Box>

      {/* Main Content */}
      <Box className="dashboard-content">
        {activeSection === 'equipment' && <EquipmentMaintenance />}
        {activeSection === 'record' && <MaintenanceRecord />}
        {activeSection === 'master' && <Master />}
        {activeSection === 'equipment master' && <EquipmentMaster />}
        {activeSection === 'equipment master record' && <EquipmentMasterRecord />}
        {activeSection === 'water testing' && <WaterTesting />}
      </Box>

      {/* Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={1500}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity="success"
          sx={{ width: '100%' }}
        >
          Successfully logged out!
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default AdminDashboard;
