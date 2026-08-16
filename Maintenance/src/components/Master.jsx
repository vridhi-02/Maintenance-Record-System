import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  TextField,
  IconButton,
  Stack,
  Button,
  Snackbar,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';

function Master() {
  const [sections, setSections] = useState([]);
  const [editValues, setEditValues] = useState({});
  const [isDirty, setIsDirty] = useState(false);
  const [newSection, setNewSection] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isAddNewSectionVisible, setIsAddNewSectionVisible] = useState(false);
  const [deletedSectionIds, setDeletedSectionIds] = useState([]);

  const [equipment, setEquipment] = useState([]);
  const [selectedSectionId, setSelectedSectionId] = useState('');
  const [equipmentEditValues, setEquipmentEditValues] = useState({});
  const [newEquipment, setNewEquipment] = useState('');
  const [deletedEquipmentIds, setDeletedEquipmentIds] = useState([]);
  const [isEquipmentEditing, setIsEquipmentEditing] = useState(false);
  const [isAddNewEquipmentVisible, setIsAddNewEquipmentVisible] = useState(false);
  const [isEquipmentDirty, setIsEquipmentDirty] = useState(false);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const fetchSections = useCallback(() => {
    axios.get('http://localhost:8081/sections')
      .then((res) => {
        setSections(res.data);
        const initial = {};
        res.data.forEach((sec) => {
          initial[sec.id] = sec.section_name;
        });
        setEditValues(initial);
        setIsDirty(false);
        setDeletedSectionIds([]);
      })
      .catch(() => showSnackbar('Failed to fetch sections', 'error'));
  }, []);

  useEffect(() => {
    fetchSections();
  }, [fetchSections]);

  useEffect(() => {
    if (selectedSectionId) {
      axios.get(`http://localhost:8081/equipment?section_id=${selectedSectionId}`)
        .then((res) => {
          setEquipment(res.data);
          const initialEquipValues = {};
          res.data.forEach((e) => {
            initialEquipValues[e.id] = e.equipment_name;
          });
          setEquipmentEditValues(initialEquipValues);
          setIsEquipmentDirty(false);
          setDeletedEquipmentIds([]);
          setNewEquipment('');
        })
        .catch(() => showSnackbar('Failed to fetch equipment', 'error'));
    } else {
      setEquipment([]);
      setEquipmentEditValues({});
    }
  }, [selectedSectionId]);

  const handleChange = (id, value) => {
    setEditValues((prev) => ({ ...prev, [id]: value }));
    setIsDirty(true);
  };

  const handleMarkDelete = (id) => {
    setDeletedSectionIds((prev) => [...prev, id]);
    setSections((prev) => prev.filter((sec) => sec.id !== id));
    setEditValues((prev) => {
      const updated = { ...prev };
      delete updated[id];
      return updated;
    });
    setIsDirty(true);
  };

  const handleSave = async () => {
    try {
      await Promise.all(
        deletedSectionIds.map((id) =>
          axios.delete(`http://localhost:8081/sections/${id}`)
        )
      );

      const updatePromises = sections.map((sec) => {
        const updatedName = editValues[sec.id];
        if (updatedName && updatedName !== sec.section_name) {
          return axios.put(`http://localhost:8081/sections/${sec.id}`, {
            section_name: updatedName,
          });
        }
        return null;
      }).filter(Boolean);

      await Promise.all(updatePromises);

      if (newSection.trim()) {
        await axios.post('http://localhost:8081/sections', {
          section_name: newSection.trim(),
        });
        setNewSection('');
      }

      fetchSections();
      setIsDirty(false);
      setIsEditing(false);
      setIsAddNewSectionVisible(false);
      showSnackbar('All changes saved successfully!');
    } catch (err) {
      console.error('Error saving sections:', err);
      showSnackbar('Failed to save some changes', 'error');
    }
  };

  const handleSaveEquipment = async () => {
    try {
      await Promise.all(
        deletedEquipmentIds.map((id) =>
          axios.delete(`http://localhost:8081/equipment/${id}`)
        )
      );

      const updatePromises = equipment.map((e) => {
        const updated = equipmentEditValues[e.id];
        if (updated && updated !== e.equipment_name) {
          return axios.put(`http://localhost:8081/equipment/${e.id}`, {
            equipment_name: updated,
          });
        }
        return null;
      }).filter(Boolean);

      await Promise.all(updatePromises);

      if (newEquipment.trim()) {
        await axios.post(`http://localhost:8081/equipment`, {
          equipment_name: newEquipment.trim(),
          section_id: selectedSectionId,
        });
        setNewEquipment('');
      }

      setIsEquipmentEditing(false);
      setIsAddNewEquipmentVisible(false);
      setIsEquipmentDirty(false);
      setDeletedEquipmentIds([]);

      const updated = await axios.get(
        `http://localhost:8081/equipment?section_id=${selectedSectionId}`
      );
      setEquipment(updated.data);

      const newEditValues = {};
      updated.data.forEach((e) => {
        newEditValues[e.id] = e.equipment_name;
      });
      setEquipmentEditValues(newEditValues);

      showSnackbar('Equipment changes saved successfully!');
    } catch (err) {
      console.error(err);
      showSnackbar('Failed to save equipment changes', 'error');
    }
  };

  return (
    <Box
      sx={{
        height: 'calc(100vh - 80px)',
        overflowY: 'auto',
        px: 3,
        py: 2,
        bgcolor: '#F9F9F9',
      }}
    >
      <Typography variant="h5" align="center" gutterBottom color="#872341">
        Section and Equipment Master
      </Typography>

      {/* Sections */}
      <Box sx={{ maxWidth: 1150, mx: 'auto', mt: 2, p: 3, bgcolor: '#FEFBF6', borderRadius: 3, boxShadow: 3 }}>
        <Typography variant="h6" gutterBottom color="#872341">Sections</Typography>

        <Box sx={{ minHeight: 120, border: '1px solid #ccc', p: 2, borderRadius: 2, mb: 2 }}>
          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
            {sections.map((section) => (
              <Box key={section.id} sx={{ display: 'flex', alignItems: 'center', bgcolor: '#fff', border: '1px solid #ccc', borderRadius: '20px', px: 1.5, py: 0.5, m: 0.5, boxShadow: 1 }}>
                <TextField
                  value={editValues[section.id] || ''}
                  onChange={(e) => handleChange(section.id, e.target.value)}
                  variant="standard"
                  InputProps={{ disableUnderline: true, readOnly: !isEditing, sx: { fontSize: 13, width: 'auto', minWidth: 80 } }}
                  size="small"
                />
                {isEditing && (
                  <IconButton onClick={() => handleMarkDelete(section.id)} color="error" size="small" sx={{ ml: 0.5 }}>
                    <CloseIcon fontSize="small" />
                  </IconButton>
                )}
              </Box>
            ))}
          </Stack>
        </Box>

        {isAddNewSectionVisible && (
          <TextField
            value={newSection}
            onChange={(e) => {
              setNewSection(e.target.value);
              setIsDirty(true);
            }}
            fullWidth
            size="small"
            sx={{ mb: 2 }}
            placeholder="Enter new section name"
          />
        )}

        <Box textAlign="center">
          <Stack direction="row" spacing={2} justifyContent="center">
            <Button variant="contained" color="primary" startIcon={<EditIcon />} onClick={() => { setIsEditing(true); setIsAddNewSectionVisible(false); }}>
              Edit
            </Button>
            <Button variant="contained" color="info" startIcon={<AddIcon />} onClick={() => { setIsAddNewSectionVisible(true); setIsEditing(false); }}>
              Add
            </Button>
            <Button variant="contained" color="success" startIcon={<SaveIcon />} onClick={handleSave} disabled={(!isEditing && !isAddNewSectionVisible) || !isDirty}>
              Save
            </Button>
          </Stack>
        </Box>
      </Box>

      {/* Equipment */}
      <Box sx={{ maxWidth: 1150, mx: 'auto', mt: 4, p: 3, bgcolor: '#FEFBF6', borderRadius: 3, boxShadow: 3 }}>
        <Typography variant="h6" gutterBottom color="#872341">Equipment</Typography>

        <FormControl size="small" sx={{ width: 200, mb: 2 }}>
          <InputLabel id="section-select-label">Select Section</InputLabel>
          <Select labelId="section-select-label" value={selectedSectionId} label="Select Section" onChange={(e) => setSelectedSectionId(e.target.value)}>
            {sections.map((section) => (
              <MenuItem key={section.id} value={section.id}>{section.section_name}</MenuItem>
            ))}
          </Select>
        </FormControl>

        {selectedSectionId && (
          <>
            <Box sx={{ minHeight: 80, mt: 2, border: '1px solid #ccc', borderRadius: 2, p: 2 }}>
              <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                {equipment.map((equip) => (
                  <Box key={equip.id} sx={{ display: 'flex', alignItems: 'center', bgcolor: '#fff', border: '1px solid #ccc', borderRadius: '20px', px: 1.5, py: 0.5, boxShadow: 1, m: 0.5 }}>
                    <TextField
                      value={equipmentEditValues[equip.id] || ''}
                      onChange={(e) => {
                        setEquipmentEditValues((prev) => ({ ...prev, [equip.id]: e.target.value }));
                        setIsEquipmentDirty(true);
                      }}
                      variant="standard"
                      InputProps={{ disableUnderline: true, readOnly: !isEquipmentEditing, sx: { fontSize: 13, width: 'auto', minWidth: 80 } }}
                      size="small"
                    />
                    {isEquipmentEditing && (
                      <IconButton onClick={() => {
                        setDeletedEquipmentIds((prev) => [...prev, equip.id]);
                        setEquipment((prev) => prev.filter((eq) => eq.id !== equip.id));
                        setIsEquipmentDirty(true);
                      }} size="small" color="error" sx={{ ml: 0.5 }}>
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    )}
                  </Box>
                ))}
              </Stack>
            </Box>

            {isAddNewEquipmentVisible && (
              <TextField
                value={newEquipment}
                onChange={(e) => {
                  setNewEquipment(e.target.value);
                  setIsEquipmentDirty(true);
                }}
                placeholder="Enter new equipment name"
                size="small"
                fullWidth
                sx={{ mt: 2, mb: 2 }}
              />
            )}

            <Box textAlign="center">
              <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 2 }}>
                <Button variant="contained" color="primary" startIcon={<EditIcon />} onClick={() => { setIsEquipmentEditing(true); setIsAddNewEquipmentVisible(false); }}>
                  Edit
                </Button>
                <Button
                  variant="contained"
                  color="info"
                  startIcon={<AddIcon />}
                  onClick={() => {
                    setIsAddNewEquipmentVisible(true);
                    setIsEquipmentEditing(false);
                  }}
                >
                  Add
                </Button>
                <Button variant="contained" color="success" startIcon={<SaveIcon />} onClick={handleSaveEquipment} disabled={(!isEquipmentEditing && !isAddNewEquipmentVisible) || !isEquipmentDirty}>
                  Save
                </Button>
              </Stack>
            </Box>
          </>
        )}
      </Box>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={1500}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          icon={false}
          sx={{
            width: '100%',
            bgcolor: snackbar.severity === 'success' ? '#4CAF50' : '#F44336',
            color: '#fff',
            fontWeight: 'bold',
            fontSize: 14,
            fontFamily: 'Open Sans, sans-serif',
            borderRadius: 2,
            boxShadow: 3,
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default Master;
