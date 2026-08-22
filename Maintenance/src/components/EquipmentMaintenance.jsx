import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Checkbox,
  Radio,
  RadioGroup,
  FormLabel,
  FormControlLabel,
  Snackbar,
  Alert
} from '@mui/material';

import PreventiveMaintenance from './PreventiveMaintenance';
import CorrectiveMaintenance from './CorrectiveMaintenance';

function EquipmentMaintenance() {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [sections, setSections] = useState([]);
  const [equipmentOptions, setEquipmentOptions] = useState([]);
  const [selectedEquipment, setSelectedEquipment] = useState([]);
  const [lastSelectedEquipment, setLastSelectedEquipment] = useState(null);
  const [equipmentDropdownOpen, setEquipmentDropdownOpen] = useState(false);

  // Department dropdown state
  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState('');

  const [maintenanceType, setMaintenanceType] = useState('');
  const [schedule, setSchedule] = useState('');
  const [issueDescription, setIssueDescription] = useState('');
  const [actionTaken, setActionTaken] = useState('');
  const [technicianName, setTechnicianName] = useState('');
  const [remark, setRemark] = useState('');
  const [taskDescription, setTaskDescription] = useState('');

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    axios.get('http://localhost:8081/sections')
      .then((res) => setSections(res.data))
      .catch((err) => console.error('Error fetching sections:', err));
  }, []);

  // Fetch departments for dropdown
  useEffect(() => {
    axios.get('http://localhost:8081/departments')
      .then((res) => setDepartments(res.data))
      .catch((err) => console.error('Error fetching departments:', err));
  }, []);

  useEffect(() => {
    if (!selectedSection) {
      setEquipmentOptions([]);
      return;
    }

    const sectionObj = sections.find(s => s.section_name === selectedSection);
    if (!sectionObj) return;

    axios.get(`http://localhost:8081/equipment?section_id=${sectionObj.id}`)
      .then((res) => setEquipmentOptions(res.data.map(item => item.equipment_name)))
      .catch((err) => console.error('Error fetching equipment:', err));
  }, [selectedSection, sections]);

  const handleSave = async () => {
    if (!selectedDate || !selectedSection || !selectedDepartment || !lastSelectedEquipment || !maintenanceType || !technicianName) {
      setSnackbar({ open: true, message: "Please fill all required fields.", severity: 'error' });
      return;
    }

    const type = maintenanceType === 'Preventive Maintenance (PM)' ? 'PM' : 'CM';

    const payload = {
      date: selectedDate,
      section: selectedSection,
      department: selectedDepartment,
      equipment: lastSelectedEquipment,
      type,
      technician_name: technicianName,
      frequency: type === 'PM' ? schedule : '',
      task_description: type === 'PM' ? taskDescription.tasks?.join(', ') || '' : '',
      details: type === 'PM' ? taskDescription.details || '' : '',
      notes: type === 'PM' ? taskDescription.notes || '' : '',
      issue_description: type === 'CM' ? issueDescription : '',
      action_taken: type === 'CM' ? actionTaken : '',
      remark: type === 'CM' ? remark : '',
    };

    try {
      const res = await axios.post('http://localhost:8081/maintenance-records', payload);

      if (res.status === 201) {
        setSnackbar({ open: true, message: '✅ Maintenance record saved successfully!', severity: 'success' });
      }
    } catch (err) {
      console.error(err?.response?.data || err.message);
      setSnackbar({ open: true, message: '❌ Failed to save maintenance record.', severity: 'error' });
    }
  };

  return (
    <>
      <Typography variant="h5" align="center" gutterBottom color="#872341">
        Equipment Maintenance(PM & CM)
      </Typography>

      <Box sx={{ maxWidth: 1200, mx: 'auto', mt: 3, p: 2, bgcolor: '#FEFBF6', borderRadius: 3, boxShadow: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 3, flexWrap: 'wrap' }}>
          <FormControl sx={{ flex: '1 1 200px' }}>
            <TextField
              label="Date"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </FormControl>

          <FormControl sx={{ flex: '1 1 200px' }}>
            <InputLabel id="department-label">Department</InputLabel>
            <Select
              labelId="department-label"
              value={selectedDepartment}
              label="Department"
              onChange={(e) => setSelectedDepartment(e.target.value)}
            >
              <MenuItem value=""><em>Select Department</em></MenuItem>
              {departments.map((dept) => (
                <MenuItem key={dept.dept_Id} value={dept.dept_Name}>
                  {dept.dept_Name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl sx={{ flex: '1 1 200px' }}>
            <InputLabel id="section-label">Section</InputLabel>
            <Select
              labelId="section-label"
              value={selectedSection}
              label="Section"
              onChange={(e) => {
                setSelectedSection(e.target.value);
                setSelectedEquipment([]);
                setMaintenanceType('');
              }}
            >
              <MenuItem value=""><em>Select Section</em></MenuItem>
              {sections.map((section) => (
                <MenuItem key={section.id} value={section.section_name}>
                  {section.section_name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl sx={{ flex: '1 1 200px' }} disabled={!selectedSection}>
            <InputLabel id="equipment-label">Equipment</InputLabel>
            <Select
              labelId="equipment-label"
              multiple
              label="Equipment"
              open={equipmentDropdownOpen}
              onOpen={() => setEquipmentDropdownOpen(true)}
              onClose={() => setEquipmentDropdownOpen(false)}
              value={selectedEquipment}
              onChange={(e) => {
                const selected = e.target.value;
                const latest = selected[selected.length - 1];
                setSelectedEquipment(selected);
                setLastSelectedEquipment(latest);
                setMaintenanceType('');
                setEquipmentDropdownOpen(false); // auto-close after selection
              }}
              renderValue={(selected) => selected.join(', ')}
            >
              {equipmentOptions.map((equipment) => (
                <MenuItem key={equipment} value={equipment}>
                  <Checkbox checked={selectedEquipment.includes(equipment)} />
                  {equipment}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Box>

      <Box sx={{ maxWidth: 1200, mx: 'auto', mt: 4, p: 2, bgcolor: '#FEFBF6', borderRadius: 3, boxShadow: 4 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', color: '#000B58' }}>
          <FormControl sx={{ flex: 1 }} disabled={selectedEquipment.length === 0}>
            <FormLabel sx={{ fontSize: 22, paddingBottom: 1 }}>Type</FormLabel>
            <RadioGroup
              row
              value={maintenanceType}
              onChange={(e) => setMaintenanceType(e.target.value)}
              sx={{ gap: 15 }}
            >
              <FormControlLabel
                value="Preventive Maintenance (PM)"
                control={<Radio />}
                label="Preventive Maintenance (PM)"
              />
              <FormControlLabel
                value="Corrective Maintenance (CM)"
                control={<Radio />}
                label="Corrective Maintenance (CM)"
              />
            </RadioGroup>
          </FormControl>

          {maintenanceType === 'Preventive Maintenance (PM)' && (
            <PreventiveMaintenance
              section={selectedSection}
              equipment={lastSelectedEquipment}
              schedule={schedule}
              setSchedule={setSchedule}
              taskDescription={taskDescription}
              setTaskDescription={setTaskDescription}
            />
          )}

          {maintenanceType === 'Corrective Maintenance (CM)' && (
            <CorrectiveMaintenance
              section={selectedSection}
              equipment={lastSelectedEquipment}
              issueDescription={issueDescription}
              setIssueDescription={setIssueDescription}
              actionTaken={actionTaken}
              setActionTaken={setActionTaken}
              remark={remark}
              setRemark={setRemark}
              technicianName={technicianName}
              setTechnicianName={setTechnicianName}
            />
          )}
        </Box>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}

export default EquipmentMaintenance;