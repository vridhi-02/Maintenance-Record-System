import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
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
  MenuItem,
} from '@mui/material';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

function MaintenanceRecord() {
  const [records, setRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  useEffect(() => {
    axios
      .get('http://localhost:8081/maintenance-records')
      .then((res) => {
        const sorted = res.data.sort((a, b) => new Date(b.date) - new Date(a.date));
        setRecords(sorted);
      })
      .catch((err) => {
        console.error('Error fetching maintenance records:', err);
      });
  }, []);

  const getVisibleFields = (type) => {
    const common = [
      { label: 'Date', key: 'date' },
      { label: 'Section', key: 'section' },
      { label: 'Equipment', key: 'equipment' },
      { label: 'Type', key: 'type' },
      { label: 'Remark', key: 'remark' },
      { label: 'Technician', key: 'technician_name' },
    ];

    const cmFields = [
      { label: 'Issue Description', key: 'issue_description' },
      { label: 'Action Taken', key: 'action_taken' },
    ];

    const pmFields = [
      { label: 'Frequency', key: 'frequency' },
      { label: 'Task Description', key: 'task_description' },
      { label: 'Details', key: 'details' },
    ];

    if (type === 'CM') return [...common, ...cmFields];
    if (type === 'PM') return [...common, ...pmFields];
    return [];
  };

  const visibleFields = getVisibleFields(typeFilter);

  const filterRecords = (type, query) => {
    const q = query.toLowerCase();
    const filtered = records.filter((record) => {
      const matchesType = record.type === type;
      const matchesQuery = Object.keys(record).some((key) =>
        String(record[key]).toLowerCase().includes(q)
      );
      return matchesType && matchesQuery;
    });
    setFilteredRecords(filtered);
    setCurrentPage(1);
  };

  const handleTypeChange = (value) => {
    setTypeFilter(value);
    filterRecords(value, searchQuery); 
  };

  const handleSearch = () => {
    if (typeFilter) {
      filterRecords(typeFilter, searchQuery); 
    }
  };

  const handleDownload = () => {
    const excelData = filteredRecords.map((record) => {
      const row = {};
      visibleFields.forEach(({ key }) => {
        row[key] = record[key] || '';
      });
      return row;
    });

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Maintenance Records');
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(data, 'maintenance_records.xlsx');
  };

  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredRecords.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(filteredRecords.length / recordsPerPage);

  return (
    <>
      <Typography
        variant="h5"
        align="center"
        gutterBottom
        color="#872341"
        fontFamily="Open Sans, sans-serif"
      >
        Maintenance Records
      </Typography>

      {/* Filter + Search */}
      <Box
        sx={{
          maxWidth: 1500,
          mx: 'auto',
          mt: 3,
          mb: 1,
          display: 'flex',
          justifyContent: 'center',
          gap: 2,
          flexWrap: 'wrap',
        }}
      >
        <TextField
          select
          label="Type"
          value={typeFilter}
          onChange={(e) => handleTypeChange(e.target.value)}
          sx={{ width: 150 }}
        >
          <MenuItem value="">Select</MenuItem>
          <MenuItem value="PM">PM</MenuItem>
          <MenuItem value="CM">CM</MenuItem>
        </TextField>

        <TextField
          placeholder="Search records..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          variant="outlined"
          sx={{ width: '30%' }}
        />

        <Button
          variant="contained"
          onClick={handleSearch}
          disabled={!typeFilter}
          sx={{ backgroundColor: '#872341' }}
        >
          Search
        </Button>
      </Box>

      {/* Show table only when type is selected */}
      {typeFilter && (
        <>
          <Box
            sx={{
              maxWidth: 1600,
              mx: 'auto',
              mt: 3,
              p: 2,
              bgcolor: '#FEFBF6',
              borderRadius: 3,
              boxShadow: 4,
            }}
          >
            <TableContainer component={Paper}>
              <Table>
                <TableHead sx={{ bgcolor: '#872341' }}>
                  <TableRow>
                    {visibleFields.map((field) => (
                      <TableCell key={field.key} sx={{ color: 'white' }}>
                        {field.label}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {currentRecords.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={visibleFields.length} align="center">
                        No maintenance records found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    currentRecords.map((record, index) => (
                      <TableRow key={index}>
                        {visibleFields.map((field) => (
                          <TableCell key={field.key}>
                            {record[field.key] || ''}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Pagination */}
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 2 }}>
              <IconButton disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)}>
                <ArrowBackIosNewIcon />
              </IconButton>
              <Typography sx={{ mx: 2 }}>
                Page {currentPage} of {totalPages}
              </Typography>
              <IconButton
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
              >
                <ArrowForwardIosIcon />
              </IconButton>
            </Box>
          </Box>

          {/* Download Button */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3, mb: 5 }}>
            <Button variant="contained" onClick={handleDownload} sx={{ backgroundColor: 'blue' }}>
              Download
            </Button>
          </Box>
        </>
      )}
    </>
  );
}

export default MaintenanceRecord;