import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Box,
  Container,
  Card,
  Typography,
  Snackbar,
  Alert,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
  Checkbox,
  ListItemText,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Button,
  IconButton,
} from '@mui/material';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

const EquipmentMasterRecord = () => {
  const [sections, setSections] = useState([]);
  const [selectedSectionId, setSelectedSectionId] = useState([]);
  const [equipmentList, setEquipmentList] = useState([]);
  const [selectedEquipmentNames, setSelectedEquipmentNames] = useState([]);
  const [equipmentMasterData, setEquipmentMasterData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [editIndex, setEditIndex] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const [sectionConfirmed, setSectionConfirmed] = useState(false);
  const [equipmentConfirmed, setEquipmentConfirmed] = useState(false);

  const [sectionDropdownOpen, setSectionDropdownOpen] = useState(false);
  const [equipmentDropdownOpen, setEquipmentDropdownOpen] = useState(false);

  const recordsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);

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
          const fetched = res.data;
          const selectedSectionName = sections.find(s => s.id === selectedSectionId[0])?.section_name || '';

          const mapped = selectedEquipmentNames.map(name => {
            const match = fetched.find(e => e.equipment_name === name);
            return match || { ...newEquipment, equipment_name: name, location: selectedSectionName };
          });
          setEquipmentMasterData(mapped);
          setFilteredData(mapped);
        })
        .catch(err => console.error('Error fetching equipment data', err));
    } else {
      setEquipmentMasterData([]);
      setFilteredData([]);
    } }, [equipmentConfirmed, selectedEquipmentNames, newEquipment]);
  

  const handleEditChange = (index, field, value) => {
    const updated = [...filteredData];
    updated[index][field] = value;

    // Auto-fill location with selected section name
    if (field === 'location') {
      const selectedSectionName = sections.find(s => s.id === selectedSectionId[0])?.section_name || '';
      updated[index].location = selectedSectionName;
    }

    setFilteredData(updated);
  };

  const handleSaveEdit = (index) => {
    const updatedItem = filteredData[index];
    axios.put(`http://localhost:8081/equipment-name/${updatedItem.equipment_name}`, updatedItem)
      .then(() => {
        setSnackbar({ open: true, message: 'Updated successfully', severity: 'success' });
        setEditIndex(null);
      })
      .catch(err => {
        console.error('Update error:', err);
        setSnackbar({ open: true, message: 'Error updating', severity: 'error' });
      });
  };

  const handleDownload = () => {
    if (filteredData.length === 0) {
      setSnackbar({ open: true, message: 'No data to download', severity: 'warning' });
      return;
    }
    const sheet = XLSX.utils.json_to_sheet(filteredData);
    const book = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(book, sheet, 'EquipmentData');
    const buffer = XLSX.write(book, { bookType: 'xlsx', type: 'array' });
    saveAs(new Blob([buffer], { type: 'application/octet-stream' }), 'equipment_master.xlsx');
  };

  const handleSearch = () => {
    const q = searchQuery.toLowerCase();
    const filtered = equipmentMasterData.filter(item =>
      Object.values(item).some(val => String(val).toLowerCase().includes(q))
    );
    setFilteredData(filtered);
    setCurrentPage(1);
  };

  const indexOfLast = currentPage * recordsPerPage;
  const indexOfFirst = indexOfLast - recordsPerPage;
  const currentRecords = filteredData.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredData.length / recordsPerPage);

  return (
    <Box sx={{ backgroundColor: '#f5f5f5', p: 3, minHeight: '100vh' }}>
      <Container maxWidth="xl">
        <Typography variant="h5" mb={3}>Equipment Master Record</Typography>

        {/* Section Selector */}
        <Stack direction="row" spacing={2} mb={2}>
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
          <Button variant="contained" onClick={() => setSectionConfirmed(true)} disabled={!selectedSectionId.length}>
            Go
          </Button>
        </Stack>

        {/* Equipment Selector */}
        {equipmentList.length > 0 && (
          <Stack direction="row" spacing={2} mb={3}>
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
                {equipmentList.map(eq => (
                  <MenuItem key={eq.id} value={eq.equipment_name}>
                    <Checkbox checked={selectedEquipmentNames.includes(eq.equipment_name)} />
                    <ListItemText primary={eq.equipment_name} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button variant="contained" onClick={() => setEquipmentConfirmed(true)} disabled={!selectedEquipmentNames.length}>
              Go
            </Button>
          </Stack>
        )}

        {/* Table with Search and Pagination */}
        {equipmentConfirmed && (
          <Card sx={{ p: 3, mb: 3 }}>
            <Stack direction="row" spacing={2} mb={2} justifyContent="center">
              <TextField
                size="small"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button variant="contained" onClick={handleSearch} sx={{ backgroundColor: '#872341' }}>
                Search
              </Button>
            </Stack>

            <TableContainer component={Paper}>
              <Table>
                <TableHead sx={{ backgroundColor: '#80002a' }}>
                  <TableRow>
                    {[...Object.keys(newEquipment), 'Actions'].map(key => (
                      <TableCell key={key} sx={{ color: 'white', fontWeight: 'bold' }}>
                        {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {currentRecords.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={Object.keys(newEquipment).length + 1} align="center">
                        No records found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    currentRecords.map((row, index) => (
                      <TableRow key={index}>
                        {Object.keys(newEquipment).map((field) => (
                          <TableCell key={field}>
                            {editIndex === index ? (
                              field === 'warranty_expiry' ? (
                                <Select
                                  variant="standard"
                                  fullWidth
                                  value={row[field] || ''}
                                  onChange={(e) => handleEditChange(index, field, e.target.value)}
                                >
                                  <MenuItem value="Yes">Yes</MenuItem>
                                  <MenuItem value="No">No</MenuItem>
                                </Select>
                              ) : (
                                <TextField
                                  variant="standard"
                                  type={dateFields.includes(field) ? 'date' : 'text'}
                                  value={dateFields.includes(field)
                                    ? (row[field] ? row[field].toString().slice(0, 10) : '')
                                    : row[field] || ''}
                                  onChange={(e) => handleEditChange(index, field, e.target.value)}
                                />
                              )
                            ) : (
                              dateFields.includes(field)
                                ? (row[field] ? row[field].toString().slice(0, 10) : '')
                                : row[field]
                            )}
                          </TableCell>
                        ))}
                        <TableCell>
                          {editIndex === index ? (
                            <Button variant="contained" color="success" onClick={() => handleSaveEdit(index)}>Save</Button>
                          ) : (
                            <Button variant="outlined" onClick={() => setEditIndex(index)}>Edit</Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            <Box display="flex" justifyContent="center" alignItems="center" mt={2}>
              <IconButton disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>
                <ArrowBackIosNewIcon />
              </IconButton>
              <Typography mx={2}>Page {currentPage} of {totalPages}</Typography>
              <IconButton disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>
                <ArrowForwardIosIcon />
              </IconButton>
            </Box>
          </Card>
        )}

        {filteredData.length > 0 && (
          <Box display="flex" justifyContent="center" mb={4}>
            <Button variant="contained" onClick={handleDownload} sx={{ backgroundColor: 'blue' }}>
              Download Excel
            </Button>
          </Box>
        )}

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

export default EquipmentMasterRecord;
