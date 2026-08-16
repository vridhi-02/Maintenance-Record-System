import React, { useState } from 'react';
import {
  TextField,
  Box,
  Typography,
  Button,
  Snackbar,
  Alert,
  Select,
  MenuItem,
  OutlinedInput,
  FormControl
} from '@mui/material';
import axios from 'axios';

const technicianList = [
  'Nilesh Bhandari',
  'Manu Yadav',
];

function CorrectiveMaintenance({
  section,
  equipment,
  issueDescription,
  setIssueDescription,
  actionTaken,
  setActionTaken,
  technicianName,
  setTechnicianName,
  remark,
  setRemark,
}) {
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  const handleSave = async () => {
    if (
      !section?.trim() ||
      !equipment?.trim() ||
      !issueDescription.trim() ||
      !actionTaken.trim() ||
      !technicianName.trim() ||
      !remark.trim()
    ) {
      setSnackbar({
        open: true,
        message: '⚠️ All fields are required.',
        severity: 'warning',
      });
      return;
    }

    const payload = {
      date: new Date().toISOString().split('T')[0],
      section,
      equipment,
      type: 'CM',
      issue_description: issueDescription,
      action_taken: actionTaken,
      remark,
      frequency: '',
      task_description: '',
      details: '',
      technician_name: technicianName,
    };

    try {
        const res = await axios.post('http://localhost:8081/maintenance-records', payload);

      if (res.status === 201) {
        setSnackbar({
          open: true,
          message: '✅ Corrective Maintenance data saved successfully!',
          severity: 'success',
        });
        setIssueDescription('');
        setActionTaken('');
        setTechnicianName('');
        setRemark('');
      }
    } catch (err) {
      console.error('❌ Error:', err?.response?.data || err.message);
      setSnackbar({
        open: true,
        message: '❌ Error saving data. Please check the server.',
        severity: 'error',
      });
    }
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Box sx={{ flex: 1 }}>
          <Typography sx={{ fontSize: 18, mb: 1 }}>
            Issue Description <span style={{ color: 'red' }}>*</span>
          </Typography>
          <TextField
            multiline
            rows={4}
            value={issueDescription}
            onChange={(e) => setIssueDescription(e.target.value)}
            fullWidth
            placeholder="Describe the issue here..."
          />
        </Box>

        <Box sx={{ flex: 1 }}>
          <Typography sx={{ fontSize: 18, mb: 1 }}>
            Action Taken <span style={{ color: 'red' }}>*</span>
          </Typography>
          <TextField
            multiline
            rows={4}
            value={actionTaken}
            onChange={(e) => setActionTaken(e.target.value)}
            fullWidth
            placeholder="Describe the action taken..."
          />
        </Box>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
        <Box sx={{ flex: 1 }}>
          <Typography sx={{ fontSize: 18, mb: 1 }}>
            Technician Name <span style={{ color: 'red' }}>*</span>
          </Typography>
          <FormControl fullWidth>
            <Select
              displayEmpty
              value={technicianName}
              onChange={(e) => setTechnicianName(e.target.value)}
              input={<OutlinedInput />}
              renderValue={(selected) => selected || 'Select technician name'}
              sx={{ backgroundColor: 'white' }}
            >
              {technicianList.map((tech) => (
                <MenuItem key={tech} value={tech}>
                  {tech}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Box sx={{ flex: 1 }}>
          <Typography sx={{ fontSize: 18, mb: 1 }}>
            Remark <span style={{ color: 'red' }}>*</span>
          </Typography>
          <TextField
            multiline
            rows={3}
            value={remark}
            onChange={(e) => setRemark(e.target.value)}
            fullWidth
            placeholder="Enter any remarks..."
          />
        </Box>
      </Box>

      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSave}
          sx={{ backgroundColor: '#0118D8' }}
        >
          Save
        </Button>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={1500}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          icon={false}
          severity={snackbar.severity}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          sx={{
            width: '100%',
            backgroundColor: 'lightblue',
            color: 'black',
            border: '1px solid',
            fontWeight: 500,
            fontSize: '16px',
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default CorrectiveMaintenance;
