import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import {
  Box,
  Card,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Button,
  IconButton,
  MenuItem,
  Stack,
} from '@mui/material';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { tokens, selectSx } from './theme';

// Columns match exactly what EquipmentMaintenance.jsx sends to
// POST /maintenance-records.
const FIELDS = [
  { label: 'Date', key: 'date' },
  { label: 'Department', key: 'department' },
  { label: 'Equipment', key: 'equipment' },
  { label: 'Machine Number', key: 'machine_number' },
  { label: 'Category', key: 'category' },
  { label: 'Type of Work', key: 'type_of_work' },
  { label: 'Work Details', key: 'work_details' },
  { label: 'HRS', key: 'hrs' },
  { label: 'Amount', key: 'amount' },
  { label: 'Remark', key: 'remark' },
];

const TYPE_OF_WORK_OPTIONS = ['PM', 'CM', 'SERVICE', 'Installation'];

function MaintenanceRecord() {
  const [records, setRecords] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [typeOfWorkFilter, setTypeOfWorkFilter] = useState('');
  const [machineryFilter, setMachineryFilter] = useState('');
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

  // Machinery options for the filter dropdown, derived from whatever
  // equipment names actually appear in the fetched records.
  const machineryOptions = useMemo(() => {
    const names = records.map((r) => r.equipment).filter(Boolean);
    return Array.from(new Set(names)).sort();
  }, [records]);

  const filteredRecords = useMemo(() => {
    const q = searchQuery.toLowerCase();

    return records.filter((record) => {
      if (q && !FIELDS.some(({ key }) => String(record[key] ?? '').toLowerCase().includes(q))) {
        return false;
      }

      if (fromDate && record.date && record.date < fromDate) return false;
      if (toDate && record.date && record.date > toDate) return false;

      if (typeOfWorkFilter && record.type_of_work !== typeOfWorkFilter) return false;

      if (machineryFilter && record.equipment !== machineryFilter) return false;

      return true;
    });
  }, [records, searchQuery, fromDate, toDate, typeOfWorkFilter, machineryFilter]);

  // Reset to page 1 whenever any filter narrows/changes the result set
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, fromDate, toDate, typeOfWorkFilter, machineryFilter]);

  const handleDownload = () => {
    const excelData = filteredRecords.map((record) => {
      const row = {};
      FIELDS.forEach(({ key, label }) => {
        row[label] = record[key] ?? '';
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

  const clearFilters = () => {
    setSearchQuery('');
    setFromDate('');
    setToDate('');
    setTypeOfWorkFilter('');
    setMachineryFilter('');
  };

  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredRecords.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / recordsPerPage));

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
      <Typography variant="h5" gutterBottom sx={{ color: tokens.maroon, mb: 3 }}>
        Maintenance Records
      </Typography>

      {/* Filters */}
      <Card
        sx={{
          p: 2.5,
          mb: 3,
          borderRadius: '16px',
          border: `1px solid ${tokens.line}`,
          boxShadow: '0 1px 2px rgba(38,33,27,0.04)',
        }}
      >
        <Stack direction="row" gap={2} flexWrap="wrap" alignItems="center">
          <TextField
            label="From Date"
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ width: 170 }}
          />

          <TextField
            label="To Date"
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ width: 170 }}
          />

          <TextField
            select
            label="Type of Work"
            value={typeOfWorkFilter}
            onChange={(e) => setTypeOfWorkFilter(e.target.value)}
            sx={{ width: 170, ...selectSx }}
          >
            <MenuItem value="">All</MenuItem>
            {TYPE_OF_WORK_OPTIONS.map((opt) => (
              <MenuItem key={opt} value={opt}>{opt}</MenuItem>
            ))}
          </TextField>

          <TextField
            select
            label="Machinery"
            value={machineryFilter}
            onChange={(e) => setMachineryFilter(e.target.value)}
            sx={{ width: 200, ...selectSx }}
          >
            <MenuItem value="">All</MenuItem>
            {machineryOptions.map((name) => (
              <MenuItem key={name} value={name}>{name}</MenuItem>
            ))}
          </TextField>

          <TextField
            placeholder="Search records..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            variant="outlined"
            sx={{ width: 260 }}
          />

          <Button variant="outlined" onClick={clearFilters} sx={{ borderColor: tokens.line, color: tokens.muted }}>
            Clear
          </Button>

          <Button
            variant="contained"
            onClick={handleDownload}
            startIcon={<FileDownloadIcon />}
            sx={{ ml: 'auto' }}
          >
            Download
          </Button>
        </Stack>
      </Card>

      <Card
        sx={{
          borderRadius: '16px',
          border: `1px solid ${tokens.line}`,
          boxShadow: '0 1px 2px rgba(38,33,27,0.04)',
          overflow: 'hidden',
        }}
      >
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: tokens.amberTint }}>
              <TableRow>
                {FIELDS.map((field) => (
                  <TableCell key={field.key} sx={{ color: tokens.amberDark, fontWeight: 700, whiteSpace: 'nowrap' }}>
                    {field.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {currentRecords.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={FIELDS.length} align="center" sx={{ color: tokens.muted, py: 4 }}>
                    No maintenance records found.
                  </TableCell>
                </TableRow>
              ) : (
                currentRecords.map((record, index) => (
                  <TableRow key={record.id ?? index} hover>
                    {FIELDS.map((field) => (
                      <TableCell key={field.key}>
                        {field.key === 'amount' && record[field.key] !== undefined && record[field.key] !== null
                          ? `₹${record[field.key]}`
                          : record[field.key] ?? ''}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 2, borderTop: `1px solid ${tokens.line}` }}>
          <IconButton disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)}>
            <ArrowBackIosNewIcon fontSize="small" />
          </IconButton>
          <Typography sx={{ mx: 2, color: tokens.muted, fontSize: '0.9rem' }}>
            Page {currentPage} of {totalPages}
          </Typography>
          <IconButton
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
          >
            <ArrowForwardIosIcon fontSize="small" />
          </IconButton>
        </Box>
      </Card>
    </Box>
  );
}

export default MaintenanceRecord;