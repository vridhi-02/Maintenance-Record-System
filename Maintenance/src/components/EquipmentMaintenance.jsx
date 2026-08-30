import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import {
  Box,
  Card,
  Grid,
  Stack,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Snackbar,
  Alert,
  Button,
  Autocomplete,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
} from '@mui/material';
import PrecisionManufacturingIcon from '@mui/icons-material/PrecisionManufacturing';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { tokens } from './theme';

const API_BASE = 'http://localhost:8081';

const TYPE_OF_WORK_OPTIONS = ['PM', 'CM', 'Service', 'Installation'];
const HRS_OPTIONS = ['1', '2', '3'];
const RATE_PER_HOUR = 400; // ₹400 per hour, used to auto-fill Amount from HRS

// Returns today's date as "YYYY-MM-DD", which is what a <input type="date"> expects.
const getTodayDate = () => new Date().toISOString().split('T')[0];

// Small section header: icon chip + title + hairline rule, so the form
// visually separates "what machine" from "what was done to it".
function SectionHeader({ icon, title }) {
  return (
    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
      <Box
        sx={{
          width: 28,
          height: 28,
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: tokens.amberTint,
          color: tokens.amberDark,
        }}
      >
        {icon}
      </Box>
      <Typography variant="subtitle1" sx={{ color: tokens.ink }}>
        {title}
      </Typography>
    </Stack>
  );
}

/**
 * The full Equipment Maintenance form. Used both for adding a new record
 * (no initialValues) and, inside a Dialog, for editing an existing one
 * (initialValues = the record being edited).
 */
function RecordForm({ initialValues, departments, categories, onSubmit, submitLabel, onCancel }) {
  const [selectedDate, setSelectedDate] = useState(initialValues?.date ?? getTodayDate());
  const [selectedDepartment, setSelectedDepartment] = useState(initialValues?.department ?? '');

  const [machineryList, setMachineryList] = useState([]);
  const [selectedMachinery, setSelectedMachinery] = useState(initialValues?.equipment ?? '');

  const [machineNumberOptions, setMachineNumberOptions] = useState([]);
  const [selectedMachineNumber, setSelectedMachineNumber] = useState(initialValues?.machine_number ?? '');

  const [selectedCategory, setSelectedCategory] = useState(initialValues?.category ?? '');

  const [typeOfWork, setTypeOfWork] = useState(initialValues?.type_of_work ?? '');
  const [workDetails, setWorkDetails] = useState(initialValues?.work_details ?? '');
  const [hrs, setHrs] = useState(initialValues?.hrs != null ? String(initialValues.hrs) : '1');
  const [amount, setAmount] = useState(
    initialValues?.amount != null ? String(initialValues.amount) : String(RATE_PER_HOUR)
  );
  const [remark, setRemark] = useState(initialValues?.remark ?? '');

  const [formError, setFormError] = useState('');

  // Fetch machinery whenever the selected Department changes
  useEffect(() => {
    if (!selectedDepartment) {
      setMachineryList([]);
      return;
    }

    const deptObj = departments.find((d) => d.dept_Name === selectedDepartment);
    if (!deptObj) return;

    axios.get(`${API_BASE}/machinery?department_id=${deptObj.dept_Id}`)
      .then((res) => setMachineryList(res.data))
      .catch((err) => console.error('Error fetching machinery:', err));
  }, [selectedDepartment, departments]);

  // Fetch machine numbers whenever the selected Machinery changes. Only
  // clears the already-picked machine number when Machinery *actually*
  // changes (not on mount/edit, where it needs to keep the saved value
  // while the options list loads in behind it).
  const prevMachineryRef = useRef(selectedMachinery);
  useEffect(() => {
    const machineryChanged = prevMachineryRef.current !== selectedMachinery;
    prevMachineryRef.current = selectedMachinery;

    if (!selectedMachinery) {
      setMachineNumberOptions([]);
      if (machineryChanged) setSelectedMachineNumber('');
      return;
    }

    const machineryObj = machineryList.find((m) => m.machinery_name === selectedMachinery);
    if (!machineryObj) {
      setMachineNumberOptions([]);
      return;
    }

    if (machineryChanged) setSelectedMachineNumber('');

    axios.get(`${API_BASE}/machine-numbers?machinery_id=${machineryObj.id}`)
      .then((res) => setMachineNumberOptions(res.data))
      .catch((err) => console.error('Error fetching machine numbers:', err));
  }, [selectedMachinery, machineryList]);

  // Auto-fill Amount from HRS × rate whenever HRS changes. Amount itself
  // is read-only — it's always derived, never typed directly.
  const handleHrsChange = (newHrsValue) => {
    setHrs(newHrsValue);
    const numericHrs = parseFloat(newHrsValue);
    setAmount(String((isNaN(numericHrs) ? 0 : numericHrs) * RATE_PER_HOUR));
  };

  const handleSubmit = () => {
    if (!selectedDate || !selectedDepartment || !selectedMachinery || !typeOfWork) {
      setFormError('Please fill all required fields.');
      return;
    }
    setFormError('');

    onSubmit({
      date: selectedDate,
      department: selectedDepartment,
      equipment: selectedMachinery,
      machine_number: selectedMachineNumber,
      category: selectedCategory,
      type_of_work: typeOfWork,
      work_details: workDetails,
      hrs: parseFloat(hrs) || 0,
      amount: parseFloat(amount) || 0,
      remark,
    });
  };

  return (
    <>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <TextField
            fullWidth
            label="Date"
            required
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <FormControl fullWidth required>
            <InputLabel id="department-label">Department</InputLabel>
            <Select
              labelId="department-label"
              value={selectedDepartment}
              label="Department"
              onChange={(e) => {
                setSelectedDepartment(e.target.value);
                setSelectedMachinery('');
              }}
            >
              <MenuItem value="">
                <em>Select Department</em>
              </MenuItem>
              {departments.map((dept) => (
                <MenuItem key={dept.dept_Id} value={dept.dept_Name}>
                  {dept.dept_Name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <FormControl fullWidth required disabled={!selectedDepartment}>
            <InputLabel id="machinery-label">Machinery</InputLabel>
            <Select
              labelId="machinery-label"
              value={selectedMachinery}
              label="Machinery"
              onChange={(e) => setSelectedMachinery(e.target.value)}
            >
              <MenuItem value="">
                <em>Select Machinery</em>
              </MenuItem>
              {machineryList.map((machinery) => (
                <MenuItem key={machinery.id} value={machinery.machinery_name}>
                  {machinery.machinery_name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <FormControl fullWidth disabled={!selectedMachinery}>
            <InputLabel id="machine-number-label">Machine Number</InputLabel>
            <Select
              labelId="machine-number-label"
              value={selectedMachineNumber}
              label="Machine Number"
              onChange={(e) => setSelectedMachineNumber(e.target.value)}
            >
              <MenuItem value="">
                <em>Select Machine Number</em>
              </MenuItem>
              {machineNumberOptions.map((mn) => (
                <MenuItem key={mn.id} value={mn.machine_number}>
                  {mn.machine_number}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Category gets the full row to itself so long category names
            are never cut off in the closed select or the menu. */}
        <Grid size={{ xs: 12 }}>
          <FormControl fullWidth>
            <InputLabel id="category-label">Category</InputLabel>
            <Select
              labelId="category-label"
              value={selectedCategory}
              label="Category"
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <MenuItem value="">
                <em>Select Category</em>
              </MenuItem>
              {categories.map((cat) => (
                <MenuItem key={cat.id} value={cat.category_name}>
                  {cat.category_name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      <Divider sx={{ my: 2, borderColor: tokens.line }} />

      <SectionHeader icon={<AssignmentIcon fontSize="small" />} title="Work Details" />

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <FormControl fullWidth required>
            <InputLabel id="type-of-work-label">Type of Work</InputLabel>
            <Select
              labelId="type-of-work-label"
              value={typeOfWork}
              label="Type of Work"
              onChange={(e) => setTypeOfWork(e.target.value)}
            >
              <MenuItem value="">
                <em>Select Type of Work</em>
              </MenuItem>
              {TYPE_OF_WORK_OPTIONS.map((opt) => (
                <MenuItem key={opt} value={opt}>
                  {opt}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 5 }}>
          <TextField
            fullWidth
            label="Work Details"
            value={workDetails}
            onChange={(e) => setWorkDetails(e.target.value)}
          />
        </Grid>

        <Grid size={{ xs: 6, sm: 3, md: 2 }}>
          {/* HRS: dropdown of 1/2/3, but freeSolo lets the user type any custom value */}
          <Autocomplete
            freeSolo
            options={HRS_OPTIONS}
            value={hrs}
            onChange={(e, newValue) => handleHrsChange(newValue ?? '')}
            onInputChange={(e, newInputValue) => handleHrsChange(newInputValue)}
            renderInput={(params) => <TextField {...params} fullWidth label="HRS" />}
          />
        </Grid>

        <Grid size={{ xs: 6, sm: 3, md: 2 }}>
          {/* Amount is always derived from HRS × rate — read-only, not typed directly. */}
          <Tooltip title="Auto-calculated from HRS — not editable">
            <TextField
              fullWidth
              label="Amount"
              value={amount}
              InputProps={{ readOnly: true }}
              helperText={`Auto: HRS × ₹${RATE_PER_HOUR}`}
              sx={{
                '& .MuiOutlinedInput-root': { bgcolor: tokens.paper, cursor: 'not-allowed' },
                '& input': { cursor: 'not-allowed' },
              }}
            />
          </Tooltip>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <TextField
            fullWidth
            label="Remark"
            value={remark}
            onChange={(e) => setRemark(e.target.value)}
            multiline
            minRows={2}
          />
        </Grid>
      </Grid>

      {formError && (
        <Typography sx={{ color: tokens.danger, fontSize: '0.85rem', mt: 1.5 }}>{formError}</Typography>
      )}

      <Stack direction="row" spacing={1.5} justifyContent="flex-end" sx={{ mt: 2 }}>
        {onCancel && (
          <Button variant="outlined" onClick={onCancel} sx={{ borderColor: tokens.line, color: tokens.muted }}>
            Cancel
          </Button>
        )}
        <Button variant="contained" size="large" onClick={handleSubmit}>
          {submitLabel}
        </Button>
      </Stack>
    </>
  );
}

const SAVED_TABLE_FIELDS = [
  { label: 'Date', key: 'date' },
  { label: 'Department', key: 'department' },
  { label: 'Equipment', key: 'equipment' },
  { label: 'Machine No.', key: 'machine_number' },
  { label: 'Category', key: 'category' },
  { label: 'Type', key: 'type_of_work' },
  { label: 'HRS', key: 'hrs' },
  { label: 'Amount', key: 'amount' },
];

function EquipmentMaintenance() {
  const [departments, setDepartments] = useState([]);
  const [categories, setCategories] = useState([]);
  // Only the single record that was just saved/edited in this session —
  // not a history pulled from the server. Nothing renders below the
  // form until this is set, so there's nothing extra to scroll past.
  const [savedRecord, setSavedRecord] = useState(null);
  const [formResetKey, setFormResetKey] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    axios.get(`${API_BASE}/departments`)
      .then((res) => setDepartments(res.data))
      .catch((err) => console.error('Error fetching departments:', err));
  }, []);

  useEffect(() => {
    axios.get(`${API_BASE}/categories`)
      .then((res) => setCategories(res.data))
      .catch((err) => console.error('Error fetching categories:', err));
  }, []);

  const handleCreate = async (payload) => {
    try {
      const res = await axios.post(`${API_BASE}/maintenance-records`, payload);
      if (res.status === 201) {
        setSnackbar({ open: true, message: 'Maintenance record saved successfully!', severity: 'success' });
        setSavedRecord({ ...payload, id: res.data.id });
        setFormResetKey((k) => k + 1); // remounts the form with fresh defaults
      }
    } catch (err) {
      console.error(err?.response?.data || err.message);
      setSnackbar({ open: true, message: 'Failed to save maintenance record.', severity: 'error' });
    }
  };

  const handleUpdate = async (payload) => {
    try {
      await axios.put(`${API_BASE}/maintenance-records/${savedRecord.id}`, payload);
      setSnackbar({ open: true, message: 'Record updated successfully!', severity: 'success' });
      setSavedRecord({ ...payload, id: savedRecord.id });
      setIsEditing(false);
    } catch (err) {
      console.error(err?.response?.data || err.message);
      setSnackbar({ open: true, message: 'Failed to update record.', severity: 'error' });
    }
  };

  const handleDelete = async () => {
    if (!savedRecord) return;
    try {
      await axios.delete(`${API_BASE}/maintenance-records/${savedRecord.id}`);
      setSnackbar({ open: true, message: 'Record deleted.', severity: 'success' });
      setSavedRecord(null);
    } catch (err) {
      console.error(err?.response?.data || err.message);
      setSnackbar({ open: true, message: 'Failed to delete record.', severity: 'error' });
    } finally {
      setConfirmingDelete(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 1080, mx: 'auto' }}>
      <Stack spacing={2}>
        <Card
          sx={{
            p: { xs: 2, md: 2.5 },
            borderRadius: '16px',
            border: `1px solid ${tokens.line}`,
            boxShadow: '0 1px 2px rgba(38,33,27,0.04)',
          }}
        >
          <SectionHeader icon={<PrecisionManufacturingIcon fontSize="small" />} title="Equipment & Location" />
          <RecordForm
            key={formResetKey}
            departments={departments}
            categories={categories}
            onSubmit={handleCreate}
            submitLabel="Save"
          />
        </Card>

        {/* Only appears once a record has actually been saved this session. */}
        {savedRecord && (
          <Card
            sx={{
              borderRadius: '16px',
              border: `1px solid ${tokens.line}`,
              boxShadow: '0 1px 2px rgba(38,33,27,0.04)',
              overflow: 'hidden',
            }}
          >
            <Stack direction="row" spacing={1} alignItems="center" sx={{ p: 2, pb: 1 }}>
              <Box
                sx={{
                  width: 28, height: 28, borderRadius: '8px', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  bgcolor: tokens.successTint, color: tokens.success,
                }}
              >
                <CheckCircleIcon fontSize="small" />
              </Box>
              <Typography variant="subtitle1" sx={{ color: tokens.ink }}>
                Saved
              </Typography>
            </Stack>

            <TableContainer>
              <Table size="small">
                <TableHead sx={{ bgcolor: tokens.amberTint }}>
                  <TableRow>
                    {SAVED_TABLE_FIELDS.map((f) => (
                      <TableCell key={f.key} sx={{ color: tokens.amberDark, fontWeight: 700, whiteSpace: 'nowrap', py: 1 }}>
                        {f.label}
                      </TableCell>
                    ))}
                    <TableCell sx={{ color: tokens.amberDark, fontWeight: 700, py: 1 }} align="right">
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow hover>
                    {SAVED_TABLE_FIELDS.map((f) => (
                      <TableCell key={f.key} sx={{ py: 1 }}>
                        {f.key === 'amount' ? `₹${savedRecord[f.key]}` : savedRecord[f.key]}
                      </TableCell>
                    ))}
                    <TableCell align="right" sx={{ py: 0.5 }}>
                      <IconButton size="small" onClick={() => setIsEditing(true)} sx={{ color: tokens.steel }}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" onClick={() => setConfirmingDelete(true)} sx={{ color: tokens.danger }}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        )}
      </Stack>

      {/* Edit dialog — reuses the exact same form as the add form above */}
      <Dialog open={isEditing} onClose={() => setIsEditing(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontFamily: '"Space Grotesk", sans-serif', fontWeight: 700 }}>
          Edit Maintenance Record
        </DialogTitle>
        <DialogContent dividers sx={{ borderColor: tokens.line }}>
          {savedRecord && (
            <RecordForm
              initialValues={savedRecord}
              departments={departments}
              categories={categories}
              onSubmit={handleUpdate}
              submitLabel="Update Record"
              onCancel={() => setIsEditing(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <Dialog open={confirmingDelete} onClose={() => setConfirmingDelete(false)}>
        <DialogTitle sx={{ fontFamily: '"Space Grotesk", sans-serif', fontWeight: 700 }}>
          Delete this record?
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ color: tokens.muted }}>
            This will permanently delete the {savedRecord?.equipment} maintenance entry from{' '}
            {savedRecord?.date}. This can't be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setConfirmingDelete(false)} sx={{ color: tokens.muted }}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleDelete} sx={{ bgcolor: tokens.danger, '&:hover': { bgcolor: '#A63930' } }}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
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

export default EquipmentMaintenance;