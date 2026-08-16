import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import {
  Box,
  Checkbox,
  FormControl,
  FormLabel,
  MenuItem,
  Select,
  OutlinedInput,
  ListItemText,
  Typography,
  Radio,
  RadioGroup,
  FormControlLabel,
  TextField,
  Button,
  Snackbar,
  Alert,
} from '@mui/material';

const predefinedTasks = [
  'Visual Inspection', 'Cleaning', 'Lubrication',
  'Electrical Inspection', 'Safety Check', 'Calibration',
  'Mechanical Inspection', 'Software Update', 'Functional Test',
];

const technicianList = [
  'Nilesh Bhandari',
  'Manu Yadav',
  
];

const SELECT_ALL = 'SELECT_ALL';

const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: 180,
      width: 320,
    },
  },
  anchorOrigin: {
    vertical: 'bottom',
    horizontal: 'left',
  },
  transformOrigin: {
    vertical: 'top',
    horizontal: 'left',
  },
  getContentAnchorEl: null,
};

function PreventiveMaintenance({ section, equipment, schedule, setSchedule, setTaskDescription }) {
  const [selectedTasks, setSelectedTasks] = useState([]);
  const [customDescription, setCustomDescription] = useState('');
  const [technicianName, setTechnicianName] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [open, setOpen] = useState(false); // Dropdown open state

  const resetFields = useCallback(() => {
    setSelectedTasks([]);
    setCustomDescription('');
    setTechnicianName('');
    setTaskDescription('');
  }, [setTaskDescription]);

  useEffect(() => {
    resetFields();
  }, [resetFields]);

  const handleTaskChange = (event) => {
    const value = event.target.value;

    if (value.includes(SELECT_ALL)) {
      const allSelected = selectedTasks.length === predefinedTasks.length;
      setSelectedTasks(allSelected ? [] : predefinedTasks);
      setOpen(false); // Close dropdown after Select All
    } else {
      const addedNewItem = value.length > selectedTasks.length;
      setSelectedTasks(value);
      if (addedNewItem) {
        setOpen(false); // Close dropdown only if a new item was added
      }
    }
  };

  useEffect(() => {
    setTaskDescription({
      tasks: selectedTasks,
      details: customDescription,
      technicianName,
    });
  }, [selectedTasks, customDescription, technicianName, setTaskDescription]);

  const isAllSelected = selectedTasks.length === predefinedTasks.length;
  const isIndeterminate = selectedTasks.length > 0 && !isAllSelected;

  const handleSave = async () => {
    if (
      !schedule || selectedTasks.length === 0 ||
      !technicianName.trim() || !section || !equipment
    ) {
      setSnackbar({ open: true, message: '⚠️ All fields are compulsory.', severity: 'warning' });
      return;
    }

    const payload = {
      date: new Date().toISOString().split('T')[0],
      section,
      equipment,
      type: 'PM',
      issue_description: '',
      action_taken: '',
      remark: '',
      frequency: schedule,
      task_description: selectedTasks.join(', '),
      details: customDescription,
      technician_name: technicianName,
    };

    try {
         const res = await axios.post('http://localhost:8081/maintenance-records', payload);
      if (res.status === 201) {
        setSnackbar({ open: true, message: '✅ Preventive Maintenance saved successfully!', severity: 'success' });
        resetFields();
      }
    } catch (err) {
      console.error('❌ Save error:', err?.response?.data || err.message);
      setSnackbar({ open: true, message: '❌ Failed to save Preventive Maintenance data.', severity: 'error' });
    }
  };

  return (
    <FormControl fullWidth sx={{ mt: 3 }}>
      <FormLabel sx={{ fontSize: 22, pb: 1 }}>
        Frequency <span style={{ color: 'red' }}>*</span>
      </FormLabel>
      <RadioGroup
        row
        value={schedule}
        onChange={(e) => setSchedule(e.target.value)}
        sx={{ gap: 5 }}
      >
        <FormControlLabel value="Weekly" control={<Radio />} label="Weekly" />
        <FormControlLabel value="15-days" control={<Radio />} label="15-days" />
        <FormControlLabel value="Monthly" control={<Radio />} label="Monthly" />
        <FormControlLabel value="Every 3-6 Months" control={<Radio />} label="Every 3-6 Months" />
      </RadioGroup>

      {schedule && (
        <Box sx={{ mt: 3 }}>
          <Typography sx={{ fontSize: 18, mb: 1 }}>
            Task Description <span style={{ color: 'red' }}>*</span>
          </Typography>

          <Box sx={{ maxWidth: 350 }}>
            <Select
              multiple
              fullWidth
              open={open}
              onOpen={() => setOpen(true)}
              onClose={() => setOpen(false)}
              value={selectedTasks}
              onChange={handleTaskChange}
              input={<OutlinedInput />}
              renderValue={(selected) => selected.join(', ')}
              MenuProps={MenuProps}
              sx={{ backgroundColor: 'white' }}
            >
              <MenuItem value={SELECT_ALL}>
                <Checkbox checked={isAllSelected} indeterminate={isIndeterminate} />
                <ListItemText primary="Select All" />
              </MenuItem>

              {predefinedTasks.map((task) => (
                <MenuItem key={task} value={task}>
                  <Checkbox checked={selectedTasks.includes(task)} />
                  <ListItemText primary={task} />
                </MenuItem>
              ))}
            </Select>
          </Box>

          {selectedTasks.length > 0 && (
            <Box sx={{ mt: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Box sx={{ flex: 1, minWidth: 250 }}>
                <Typography sx={{ fontSize: 18, mb: 1 }}>
                  Details <span style={{ color: 'red' }}>*</span>
                </Typography>
                <TextField
                  multiline
                  minRows={3}
                  fullWidth
                  value={customDescription}
                  onChange={(e) => setCustomDescription(e.target.value)}
                  placeholder="Enter detailed task information..."
                />
              </Box>

              <Box sx={{ flex: 1, minWidth: 250 }}>
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
            </Box>
          )}

          {selectedTasks.length > 0 && (
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
          )}
        </Box>
      )}

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
    </FormControl>
  );
}

export default PreventiveMaintenance;
