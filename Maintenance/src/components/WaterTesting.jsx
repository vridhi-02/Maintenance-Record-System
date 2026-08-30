import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Card,
  Typography,
  TextField,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Snackbar,
  Alert,
  Grid,
  Stack,
  Divider,
  InputAdornment,
} from '@mui/material';
import ScienceIcon from '@mui/icons-material/Science';
import SearchIcon from '@mui/icons-material/Search';
import DownloadIcon from '@mui/icons-material/Download';
import * as XLSX from 'xlsx';
import { tokens } from './theme';

// Returns today's date as 'YYYY-MM-DD', which is what a native
// <input type="date"> expects for its value.
const getTodayDate = () => {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

export default function WaterTesting() {
  const [form, setForm] = useState({
    Date: getTodayDate(),
    Location_testpoint: '',
    TDS: '',
    hardness: '',
    Comments_actiontaken: '',
    Remark: '',
  });

  const [records, setRecords] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    fetch('http://localhost:8081/water-testing')
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Server responded ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        // Guarantee records is always an array, even if the API
        // ever returns something unexpected.
        setRecords(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error('Fetch error:', err);
        setRecords([]);
        setSnackbar({
          open: true,
          message: 'Failed to load water test records.',
          severity: 'error',
        });
      });
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.Date || !form.Location_testpoint || !form.TDS || !form.hardness) {
      setSnackbar({ open: true, message: 'Please fill all required fields.', severity: 'error' });
      return;
    }

    fetch('http://localhost:8081/water-testing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Server responded ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        // Use functional update + array guard so this can never
        // throw "records is not iterable" again, even if a prior
        // fetch left state in an unexpected shape.
        setRecords((prev) => [
          { ...form, id: data.id },
          ...(Array.isArray(prev) ? prev : []),
        ]);
        setForm({
          Date: getTodayDate(),
          Location_testpoint: '',
          TDS: '',
          hardness: '',
          Comments_actiontaken: '',
          Remark: '',
        });
        setSnackbar({ open: true, message: 'Water test record added!', severity: 'success' });
      })
      .catch((err) => {
        console.error('Submit error:', err);
        setSnackbar({ open: true, message: 'Failed to save water test record.', severity: 'error' });
      });
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString)
      .toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit',
      })
      .replaceAll('/', '-');
  };

  // Filter records across all visible columns using the search term.
  const filteredRecords = useMemo(() => {
    if (!searchTerm.trim()) return records;
    const term = searchTerm.trim().toLowerCase();
    return records.filter((row) =>
      [
        formatDate(row.Date),
        row.Location_testpoint,
        row.TDS,
        row.hardness,
        row.Comments_actiontaken,
        row.Remark,
      ]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(term))
    );
  }, [records, searchTerm]);

  const handleDownloadExcel = () => {
    if (filteredRecords.length === 0) {
      setSnackbar({ open: true, message: 'No records to export.', severity: 'error' });
      return;
    }

    const exportData = filteredRecords.map((row) => ({
      Date: formatDate(row.Date),
      'Location / Test Point': row.Location_testpoint,
      'TDS (ppm)': row.TDS,
      'Hardness (mg/L)': row.hardness,
      'Comments / Action Taken': row.Comments_actiontaken,
      Remarks: row.Remark,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    // Reasonable column widths so the export doesn't render squished.
    worksheet['!cols'] = [
      { wch: 12 },
      { wch: 22 },
      { wch: 10 },
      { wch: 14 },
      { wch: 30 },
      { wch: 24 },
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Water Testing');

    const filename = `water-testing-records-${getTodayDate()}.xlsx`;
    XLSX.writeFile(workbook, filename);
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      <Stack spacing={3}>
        {/* Form */}
        <Card
          sx={{
            p: { xs: 2.5, md: 3.5 },
            borderRadius: '16px',
            border: `1px solid ${tokens.line}`,
            boxShadow: '0 1px 2px rgba(38,33,27,0.04)',
          }}
        >
          <Stack direction="row" spacing={1.25} alignItems="center" sx={{ mb: 2.5 }}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: '9px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: tokens.amberTint,
                color: tokens.amberDark,
              }}
            >
              <ScienceIcon fontSize="small" />
            </Box>
            <Typography variant="subtitle1" sx={{ color: tokens.ink }}>
              Record New Test
            </Typography>
          </Stack>

          <form onSubmit={handleSubmit}>
            <Grid container spacing={2.5}>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <TextField
                  label="Date"
                  type="date"
                  name="Date"
                  value={form.Date}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                  required
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <TextField
                  label="Location / Test Point"
                  name="Location_testpoint"
                  value={form.Location_testpoint}
                  onChange={handleChange}
                  fullWidth
                  required
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <TextField
                  label="TDS (ppm)"
                  name="TDS"
                  value={form.TDS}
                  onChange={handleChange}
                  type="number"
                  fullWidth
                  required
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <TextField
                  label="Hardness (mg/L)"
                  name="hardness"
                  value={form.hardness}
                  onChange={handleChange}
                  type="number"
                  fullWidth
                  required
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <TextField
                  label="Comments / Action Taken"
                  name="Comments_actiontaken"
                  value={form.Comments_actiontaken}
                  onChange={handleChange}
                  multiline
                  rows={1}
                  fullWidth
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <TextField
                  label="Remarks"
                  name="Remark"
                  value={form.Remark}
                  onChange={handleChange}
                  multiline
                  rows={1}
                  fullWidth
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 3, borderColor: tokens.line }} />

            <Stack direction="row" justifyContent="flex-end">
              <Button type="submit" variant="contained" size="large">
                Save Test Record
              </Button>
            </Stack>
          </form>
        </Card>

        {/* Records Table */}
        <Card
          sx={{
            borderRadius: '16px',
            border: `1px solid ${tokens.line}`,
            boxShadow: '0 1px 2px rgba(38,33,27,0.04)',
            overflow: 'hidden',
          }}
        >
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            justifyContent="space-between"
            alignItems={{ xs: 'stretch', sm: 'center' }}
            spacing={1.5}
            sx={{ p: 2.5, pb: 1.5 }}
          >
            <Typography variant="subtitle1" sx={{ color: tokens.ink }}>
              Test Records
            </Typography>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
              <TextField
                size="small"
                placeholder="Search records..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
                sx={{ minWidth: { xs: '100%', sm: 240 } }}
              />
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={handleDownloadExcel}
                sx={{ whiteSpace: 'nowrap' }}
              >
                Download Excel
              </Button>
            </Stack>
          </Stack>

          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: tokens.amberTint }}>
                <TableRow>
                  <TableCell sx={{ color: tokens.amberDark, fontWeight: 700 }}>Date</TableCell>
                  <TableCell sx={{ color: tokens.amberDark, fontWeight: 700 }}>Location / Test Point</TableCell>
                  <TableCell sx={{ color: tokens.amberDark, fontWeight: 700 }}>TDS (ppm)</TableCell>
                  <TableCell sx={{ color: tokens.amberDark, fontWeight: 700 }}>Hardness (mg/L)</TableCell>
                  <TableCell sx={{ color: tokens.amberDark, fontWeight: 700 }}>Comments / Action Taken</TableCell>
                  <TableCell sx={{ color: tokens.amberDark, fontWeight: 700 }}>Remarks</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredRecords.length > 0 ? (
                  filteredRecords.map((row) => (
                    <TableRow key={row.id || row.Date + row.Location_testpoint} hover>
                      <TableCell>{formatDate(row.Date)}</TableCell>
                      <TableCell>{row.Location_testpoint}</TableCell>
                      <TableCell>{row.TDS}</TableCell>
                      <TableCell>{row.hardness}</TableCell>
                      <TableCell>{row.Comments_actiontaken}</TableCell>
                      <TableCell>{row.Remark}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ color: tokens.muted, py: 4 }}>
                      {records.length === 0 ? 'No records found.' : 'No records match your search.'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      </Stack>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={2500}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}