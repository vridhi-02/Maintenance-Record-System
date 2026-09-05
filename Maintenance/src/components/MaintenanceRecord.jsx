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
import SearchIcon from '@mui/icons-material/Search';

import { tokens, selectSx } from './theme';

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

const getTodayDate = () => new Date().toISOString().split('T')[0];

function MaintenanceRecord() {
  const [records, setRecords] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [typeOfWorkFilter, setTypeOfWorkFilter] = useState('');
  const [machineryFilter, setMachineryFilter] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;
  const todayDate = getTodayDate();

  useEffect(() => {
    axios
      .get('http://localhost:8081/maintenance-records')
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : [];
        const sorted = [...data].sort((a, b) => new Date(b.date) - new Date(a.date));
        setRecords(sorted);
      })
      .catch((err) => console.error('Error fetching maintenance records:', err));
  }, []);

  const machineryOptions = useMemo(() => {
    const names = records
      .map((record) => record.equipment)
      .filter((name) => name !== null && name !== undefined && String(name).trim() !== '');
    return Array.from(new Set(names.map((name) => String(name)))).sort((a, b) => a.localeCompare(b));
  }, [records]);

  const filteredRecords = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return records.filter((record) => {
      if (q) {
        const found = FIELDS.some(({ key }) =>
          String(record[key] ?? '').toLowerCase().includes(q)
        );
        if (!found) return false;
      }

      if (fromDate && record.date) {
        const recordDate = String(record.date).substring(0, 10);
        if (recordDate < fromDate) return false;
      }

      if (toDate && record.date) {
        const recordDate = String(record.date).substring(0, 10);
        if (recordDate > toDate) return false;
      }

      if (typeOfWorkFilter !== '' && String(record.type_of_work ?? '') !== typeOfWorkFilter) {
        return false;
      }

      if (machineryFilter !== '' && String(record.equipment ?? '') !== machineryFilter) {
        return false;
      }

      return true;
    });
  }, [records, searchQuery, fromDate, toDate, typeOfWorkFilter, machineryFilter]);

  const handleSearch = () => {
    setHasSearched(true);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setFromDate('');
    setToDate('');
    setTypeOfWorkFilter('');
    setMachineryFilter('');
    setHasSearched(false);
    setCurrentPage(1);
  };

  const handleSearchKeyDown = (event) => {
    if (event.key === 'Enter') handleSearch();
  };

  const recordsToShow = hasSearched ? filteredRecords : [];
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = recordsToShow.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.max(1, Math.ceil(recordsToShow.length / recordsPerPage));

  const handleDownload = () => {
    if (!hasSearched || filteredRecords.length === 0) return;

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

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
      <Typography variant="h5" gutterBottom sx={{ color: tokens.maroon, mb: 3 }}>
        Maintenance Records
      </Typography>

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
            inputProps={{ max: toDate || todayDate }}
            sx={{ width: 170 }}
          />

          {/* To Date is capped at today so future dates can't be picked */}
          <TextField
            label="To Date"
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            inputProps={{ max: todayDate, min: fromDate || undefined }}
            sx={{ width: 170 }}
          />

          {/* displayEmpty makes the "" MenuItem's text ("All") actually
              render when nothing is selected — without it MUI shows a
              blank field even though the MenuItem exists. */}
          <TextField
            select
            label="Type of Work"
            value={typeOfWorkFilter}
            onChange={(e) => setTypeOfWorkFilter(e.target.value)}
            SelectProps={{ displayEmpty: true }}
            InputLabelProps={{ shrink: true }}
            sx={{ width: 180, ...selectSx }}
          >
            <MenuItem value="">All</MenuItem>
            {TYPE_OF_WORK_OPTIONS.map((option) => (
              <MenuItem key={option} value={option}>{option}</MenuItem>
            ))}
          </TextField>

          <TextField
            select
            label="Machinery"
            value={machineryFilter}
            onChange={(e) => setMachineryFilter(e.target.value)}
            SelectProps={{ displayEmpty: true }}
            InputLabelProps={{ shrink: true }}
            sx={{ width: 220, ...selectSx }}
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
            onKeyDown={handleSearchKeyDown}
            variant="outlined"
            sx={{ width: 260 }}
          />

          <Button variant="contained" onClick={handleSearch} startIcon={<SearchIcon />} sx={{ minWidth: 110 }}>
            Search
          </Button>

          <Button variant="outlined" onClick={clearFilters} sx={{ borderColor: tokens.line, color: tokens.muted }}>
            Clear
          </Button>

          <Button
            variant="contained"
            onClick={handleDownload}
            startIcon={<FileDownloadIcon />}
            disabled={!hasSearched || filteredRecords.length === 0}
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
                  <TableCell
                    key={field.key}
                    sx={{ color: tokens.amberDark, fontWeight: 700, whiteSpace: 'nowrap' }}
                  >
                    {field.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>

            <TableBody>
              {!hasSearched ? (
                <TableRow>
                  <TableCell colSpan={FIELDS.length} align="center" sx={{ color: tokens.muted, py: 6 }}>
                    Please search to view maintenance records.
                  </TableCell>
                </TableRow>
              ) : currentRecords.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={FIELDS.length} align="center" sx={{ color: tokens.muted, py: 6 }}>
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

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            py: 2,
            borderTop: `1px solid ${tokens.line}`,
          }}
        >
          <IconButton
            disabled={!hasSearched || currentPage === 1}
            onClick={() => setCurrentPage((page) => page - 1)}
          >
            <ArrowBackIosNewIcon fontSize="small" />
          </IconButton>

          <Typography sx={{ mx: 2, color: tokens.muted, fontSize: '0.9rem' }}>
            {hasSearched ? `Page ${currentPage} of ${totalPages}` : 'No records displayed'}
          </Typography>

          <IconButton
            disabled={!hasSearched || currentPage === totalPages}
            onClick={() => setCurrentPage((page) => page + 1)}
          >
            <ArrowForwardIosIcon fontSize="small" />
          </IconButton>
        </Box>
      </Card>
    </Box>
  );
}

export default MaintenanceRecord;