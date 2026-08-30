import React, { useEffect, useState } from 'react';
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
} from '@mui/material';
import PrecisionManufacturingIcon from '@mui/icons-material/PrecisionManufacturing';
import AssignmentIcon from '@mui/icons-material/Assignment';
import { tokens } from './theme';

const TYPE_OF_WORK_OPTIONS = ['PM', 'CM', 'Service', 'Installation'];
const HRS_OPTIONS = ['1', '2', '3'];
const RATE_PER_HOUR = 400; // ₹400 per hour, used to auto-fill Amount from HRS

// Returns today's date as "YYYY-MM-DD", which is what a <input type="date"> expects.
const getTodayDate = () => new Date().toISOString().split('T')[0];

// Small section header: icon chip + title + hairline rule, so the form
// visually separates "what machine" from "what was done to it".
function SectionHeader({ icon, title }) {
  return (
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
        {icon}
      </Box>
      <Typography variant="subtitle1" sx={{ color: tokens.ink }}>
        {title}
      </Typography>
    </Stack>
  );
}

function EquipmentMaintenance() {
  // Defaults to today; the field is still editable if the user needs to backdate an entry.
  const [selectedDate, setSelectedDate] = useState(getTodayDate());

  // Machinery dropdown state (filtered by the selected Department). Single-select.
  const [machineryList, setMachineryList] = useState([]);
  const [selectedMachinery, setSelectedMachinery] = useState('');

  // Department dropdown state
  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState('');

  // Machine Number dropdown state (filtered by the selected Machinery)
  const [machineNumberOptions, setMachineNumberOptions] = useState([]);
  const [selectedMachineNumber, setSelectedMachineNumber] = useState('');

  // Category dropdown state (independent master list)
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');

  // Work details
  const [typeOfWork, setTypeOfWork] = useState('');
  const [workDetails, setWorkDetails] = useState('');
  const [hrs, setHrs] = useState('1'); // dropdown of 1/2/3, but user can type a custom value too
  const [amount, setAmount] = useState(String(RATE_PER_HOUR)); // auto-fills from hrs, user can overwrite
  const [remark, setRemark] = useState('');

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Fetch departments for dropdown
  useEffect(() => {
    axios.get('http://localhost:8081/departments')
      .then((res) => setDepartments(res.data))
      .catch((err) => console.error('Error fetching departments:', err));
  }, []);

  // Fetch categories for dropdown (independent of machinery/department)
  useEffect(() => {
    axios.get('http://localhost:8081/categories')
      .then((res) => setCategories(res.data))
      .catch((err) => console.error('Error fetching categories:', err));
  }, []);

  // Fetch machinery whenever the selected Department changes
  useEffect(() => {
    if (!selectedDepartment) {
      setMachineryList([]);
      return;
    }

    const deptObj = departments.find((d) => d.dept_Name === selectedDepartment);
    if (!deptObj) return;

    axios.get(`http://localhost:8081/machinery?department_id=${deptObj.dept_Id}`)
      .then((res) => setMachineryList(res.data))
      .catch((err) => console.error('Error fetching machinery:', err));
  }, [selectedDepartment, departments]);

  // Fetch machine numbers whenever the selected Machinery changes
  useEffect(() => {
    setSelectedMachineNumber('');
    if (!selectedMachinery) {
      setMachineNumberOptions([]);
      return;
    }

    const machineryObj = machineryList.find((m) => m.machinery_name === selectedMachinery);
    if (!machineryObj) {
      setMachineNumberOptions([]);
      return;
    }

    axios.get(`http://localhost:8081/machine-numbers?machinery_id=${machineryObj.id}`)
      .then((res) => setMachineNumberOptions(res.data))
      .catch((err) => console.error('Error fetching machine numbers:', err));
  }, [selectedMachinery, machineryList]);

  // Auto-fill Amount from HRS × rate whenever HRS changes.
  // The Amount field itself stays freely editable afterwards.
  const handleHrsChange = (newHrsValue) => {
    setHrs(newHrsValue);
    const numericHrs = parseFloat(newHrsValue);
    if (!isNaN(numericHrs)) {
      setAmount(String(numericHrs * RATE_PER_HOUR));
    }
  };

  const handleSave = async () => {
    if (!selectedDate || !selectedDepartment || !selectedMachinery || !typeOfWork) {
      setSnackbar({ open: true, message: 'Please fill all required fields.', severity: 'error' });
      return;
    }

    const payload = {
      date: selectedDate,
      department: selectedDepartment,
      equipment: selectedMachinery, // maintenance record table still uses the "equipment" column
      machine_number: selectedMachineNumber,
      category: selectedCategory,
      type_of_work: typeOfWork,
      work_details: workDetails,
      hrs: parseFloat(hrs) || 0,
      amount: parseFloat(amount) || 0,
      remark,
    };

    try {
      const res = await axios.post('http://localhost:8081/maintenance-records', payload);

      if (res.status === 201) {
        setSnackbar({ open: true, message: 'Maintenance record saved successfully!', severity: 'success' });

        // Reset the form back to its defaults right away so the next entry
        // starts clean, instead of requiring a page refresh to clear the fields.
        setSelectedDate(getTodayDate());
        setSelectedDepartment('');
        setSelectedMachinery('');
        setSelectedMachineNumber('');
        setSelectedCategory('');
        setTypeOfWork('');
        setWorkDetails('');
        setHrs('1');
        setAmount(String(RATE_PER_HOUR));
        setRemark('');
      }
    } catch (err) {
      console.error(err?.response?.data || err.message);
      setSnackbar({ open: true, message: 'Failed to save maintenance record.', severity: 'error' });
    }
  };

  return (
    <Box sx={{ maxWidth: 1080, mx: 'auto' }}>
      <Stack spacing={3}>
        {/* Section 1 — what machine, where */}
        <Card
          sx={{
            p: { xs: 2.5, md: 3.5 },
            borderRadius: '16px',
            border: `1px solid ${tokens.line}`,
            boxShadow: '0 1px 2px rgba(38,33,27,0.04)',
          }}
        >
          <SectionHeader icon={<PrecisionManufacturingIcon fontSize="small" />} title="Equipment & Location" />

          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
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

            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
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

            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
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

            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
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

            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
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
        </Card>

        {/* Section 2 — what was done */}
        <Card
          sx={{
            p: { xs: 2.5, md: 3.5 },
            borderRadius: '16px',
            border: `1px solid ${tokens.line}`,
            boxShadow: '0 1px 2px rgba(38,33,27,0.04)',
          }}
        >
          <SectionHeader icon={<AssignmentIcon fontSize="small" />} title="Work Details" />

          <Grid container spacing={2.5}>
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
              {/* Amount: auto-fills from HRS × rate, but stays freely editable */}
              <TextField
                fullWidth
                label="Amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                helperText={`Auto: HRS × ₹${RATE_PER_HOUR}`}
              />
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

          <Divider sx={{ my: 3, borderColor: tokens.line }} />

          <Stack direction="row" justifyContent="flex-end">
            <Button variant="contained" size="large" onClick={handleSave}>
              Save
            </Button>
          </Stack>
        </Card>
      </Stack>

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