import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Container,
  Card,
  Typography,
  Divider,
  Snackbar,
  Alert,
  Box,
  Select,
  InputLabel,
  FormControl,
  OutlinedInput,
  Checkbox,
  ListItemText,
  MenuItem,
  TextField,
  Button,
  Stack,
} from '@mui/material';

const EquipmentMaster = () => {
  const [sections, setSections] = useState([]);
  const [selectedSectionId, setSelectedSectionId] = useState([]);
  const [equipmentList, setEquipmentList] = useState([]);
  const [selectedEquipmentNames, setSelectedEquipmentNames] = useState([]);
  const [equipmentMasterData, setEquipmentMasterData] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
 
  const [sectionDropdownOpen, setSectionDropdownOpen] = useState(false);
  const [equipmentDropdownOpen, setEquipmentDropdownOpen] = useState(false);

  const [sectionConfirmed, setSectionConfirmed] = useState(false);
  const [equipmentConfirmed, setEquipmentConfirmed] = useState(false);

  const [showAddForm, setShowAddForm] = useState(false);

  const [newEquipment] = useState({
    equipment_name: '',
    make_brand: '',
    model_number: '',
    serial_number: '',
    date_of_purchase: '',
    location: '',
    price: '',
    AMC_Detail: '',
    warranty_expiry: '',
    last_service_date: '',
    next_service_due: '',
    vendor_contact_name: '',
    remark: '',
  });

  const [newForm, setNewForm] = useState({ ...newEquipment });

  const dateFields = ['date_of_purchase', 'last_service_date', 'next_service_due'];

  useEffect(() => {
    axios.get('http://localhost:8081/sections')
      .then(res => setSections(res.data))
      .catch(err => console.error('Error fetching sections', err));
  }, []);

  useEffect(() => {
    if (sectionConfirmed && selectedSectionId.length > 0) {
      const query = selectedSectionId.map(id => `section_id=${id}`).join('&');
      axios.get(`http://localhost:8081/equipment?${query}`)
        .then(res => setEquipmentList(res.data))
        .catch(err => console.error('Error fetching equipment list', err));
    } else {
      setEquipmentList([]);
    }
    setSelectedEquipmentNames([]);
    setEquipmentConfirmed(false);
  }, [sectionConfirmed, selectedSectionId]);


  useEffect(() => {
    if (equipmentConfirmed && selectedEquipmentNames.length > 0) {
      axios.post(`http://localhost:8081/equipment-name-data`, { names: selectedEquipmentNames })
        .then(res => {
          const fetchedData = res.data;
          const allData = selectedEquipmentNames.map(name => {
            const match = fetchedData.find(d => d.equipment_name === name);
            return match || { ...newEquipment, equipment_name: name };
          });
          setEquipmentMasterData(allData);
        })
        .catch(err => console.error('Error fetching master data', err));
    } else {
      setEquipmentMasterData([]);
    }
  }, [equipmentConfirmed, selectedEquipmentNames, newEquipment]);


 

  const handleSaveEdit = (index) => {
    const updatedItem = equipmentMasterData[index];
    axios.put(`http://localhost:8081/equipment-name/${updatedItem.equipment_name}`, updatedItem)
      .then(() => {
        setSnackbar({ open: true, message: 'Equipment updated successfully', severity: 'success' });
       
      })
      .catch(err => {
        console.error('Error updating equipment:', err);
        setSnackbar({ open: true, message: 'Error updating equipment', severity: 'error' });
      });
  };

  const handleAddEquipment = (e) => {
    e.preventDefault();
    axios.post('http://localhost:8081/add-equipment', newForm)
      .then(() => {
        setSnackbar({ open: true, message: 'Equipment added successfully', severity: 'success' });
        setNewForm({ ...newEquipment });
        setShowAddForm(false);
        setEquipmentConfirmed(false);
        setTimeout(() => setEquipmentConfirmed(true), 300);
      })
      .catch((err) => {
        console.error('Add error:', err);
        setSnackbar({ open: true, message: 'Failed to add equipment', severity: 'error' });
      });
  };

  const handleShowAddForm = () => {
    let updatedForm = { ...newEquipment };

    if (selectedEquipmentNames.length === 1) {
      updatedForm.equipment_name = selectedEquipmentNames[0];
    }

    if (selectedSectionId.length === 1) {
      const section = sections.find(s => s.id === selectedSectionId[0]);
      if (section) {
        updatedForm.location = section.section_name;
      }
    }

    setNewForm(updatedForm);
    setShowAddForm(true);
  };

  return (
    <Box sx={{ height: '100vh', overflow: 'auto', p: 2, backgroundColor: '#f5f5f5' }}>
      <Container maxWidth="xl">
        <Card sx={{ p: 3, mb: 4 }}>
          <Typography variant="h5" gutterBottom>Equipment Master</Typography>
          <Divider sx={{ mb: 3 }} />

          {/* Section Dropdown */}
          <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Select Sections</InputLabel>
              <Select
                multiple
                open={sectionDropdownOpen}
                onOpen={() => setSectionDropdownOpen(true)}
                onClose={() => setSectionDropdownOpen(false)}
                value={selectedSectionId}
                onChange={(e) => {
                  const value = e.target.value;
                  const allSelected = selectedSectionId.length === sections.length;
                  if (value.includes('all')) {
                    setSelectedSectionId(allSelected ? [] : sections.map(s => s.id));
                  } else {
                    setSelectedSectionId(value);
                  }
                  setSectionDropdownOpen(false);
                }}
                input={<OutlinedInput label="Select Sections" />}
                renderValue={(selected) =>
                  selected.length === sections.length
                    ? 'All Sections'
                    : sections.filter(s => selected.includes(s.id)).map(s => s.section_name).join(', ')
                }
              >
                <MenuItem value="all">
                  <Checkbox checked={selectedSectionId.length === sections.length} />
                  <ListItemText primary="Select All" />
                </MenuItem>
                {sections.map((s) => (
                  <MenuItem key={s.id} value={s.id}>
                    <Checkbox checked={selectedSectionId.includes(s.id)} />
                    <ListItemText primary={s.section_name} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button
              variant="contained"
              onClick={() => setSectionConfirmed(true)}
              disabled={selectedSectionId.length === 0}
              sx={{ whiteSpace: 'nowrap' }}
            >
              Go
            </Button>
          </Stack>

          {/* Equipment Dropdown */}
          {equipmentList.length > 0 && (
            <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Select Equipment</InputLabel>
                <Select
                  multiple
                  open={equipmentDropdownOpen}
                  onOpen={() => setEquipmentDropdownOpen(true)}
                  onClose={() => setEquipmentDropdownOpen(false)}
                  value={selectedEquipmentNames}
                  onChange={(e) => {
                    const value = e.target.value;
                    const allSelected = selectedEquipmentNames.length === equipmentList.length;
                    if (value.includes('all')) {
                      setSelectedEquipmentNames(allSelected ? [] : equipmentList.map(eq => eq.equipment_name));
                    } else {
                      setSelectedEquipmentNames(value);
                    }
                    setEquipmentDropdownOpen(false);
                  }}
                  input={<OutlinedInput label="Select Equipment" />}
                  renderValue={(selected) => selected.join(', ')}
                >
                  <MenuItem value="all">
                    <Checkbox checked={selectedEquipmentNames.length === equipmentList.length} />
                    <ListItemText primary="Select All" />
                  </MenuItem>
                  {equipmentList.map((eq) => (
                    <MenuItem key={eq.id} value={eq.equipment_name}>
                      <Checkbox checked={selectedEquipmentNames.includes(eq.equipment_name)} />
                      <ListItemText primary={eq.equipment_name} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Button
                variant="contained"
                onClick={() => setEquipmentConfirmed(true)}
                disabled={selectedEquipmentNames.length === 0}
                sx={{ whiteSpace: 'nowrap' }}
              >
                Go
              </Button>
            </Stack>
          )}

          {/* Centered Add Button */}
          {equipmentConfirmed && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleShowAddForm}
              >
                Add
              </Button>
            </Box>
          )}

          {/* Add Equipment Form */}
          {showAddForm && (
            <Box
              component="form"
              onSubmit={handleAddEquipment}
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                gap: 2,
                backgroundColor: '#fff',
                p: 2,
                borderRadius: 2,
                boxShadow: 1
              }}
            >
              {Object.entries(newEquipment).map(([field]) => {
                if (field === 'warranty_expiry') {
                  return (
                    <FormControl fullWidth key={field}>
                      <InputLabel>Warranty Expiry</InputLabel>
                      <Select
                        value={newForm[field]}
                        onChange={(e) => setNewForm({ ...newForm, [field]: e.target.value })}
                        label="Warranty Expiry"
                      >
                        <MenuItem value="Yes">Yes</MenuItem>
                        <MenuItem value="NO">No</MenuItem>
                        
                      </Select>
                    </FormControl>
                  );
                }

                return (
                  <TextField
                    key={field}
                    label={field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    type={dateFields.includes(field) ? 'date' : 'text'}
                    name={field}
                    value={newForm[field]}
                    onChange={(e) => setNewForm({ ...newForm, [field]: e.target.value })}
                    InputLabelProps={dateFields.includes(field) ? { shrink: true } : {}}
                    fullWidth
                    required={field === 'equipment_name'}
                  />
                );
              })}
              <Button
                type="submit"
                variant="contained"
                size="small"
                color="success"
                sx={{ gridColumn: '1 / -1', justifySelf: 'center' }}
              >
                Save Equipment
              </Button>
            </Box>
          )}
        </Card>

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={2000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
};

export default EquipmentMaster;
