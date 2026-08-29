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
  Snackbar,
  Alert,
  Button,
  Autocomplete
} from '@mui/material';

const TYPE_OF_WORK_OPTIONS = ['PM', 'CM', 'SERVICE', 'Installation'];
const HRS_OPTIONS = ['1', '2', '3'];
const RATE_PER_HOUR = 400; // ₹400 per hour, used to auto-fill Amount from HRS

function EquipmentMaintenance() {
  const [selectedDate, setSelectedDate] = useState('');

  // Machinery dropdown state (filtered by the selected Department).
  const [machineryList, setMachineryList] = useState([]);
  const [selectedMachinery, setSelectedMachinery] = useState([]);
  const [lastSelectedMachinery, setLastSelectedMachinery] = useState(null);
  const [machineryDropdownOpen, setMachineryDropdownOpen] = useState(false);

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

    const deptObj = departments.find(d => d.dept_Name === selectedDepartment);
    if (!deptObj) return;

    axios.get(`http://localhost:8081/machinery?department_id=${deptObj.dept_Id}`)
      .then((res) => setMachineryList(res.data))
      .catch((err) => console.error('Error fetching machinery:', err));
  }, [selectedDepartment, departments]);

  // Fetch machine numbers whenever the last selected Machinery changes
  useEffect(() => {
    setSelectedMachineNumber('');
    if (!lastSelectedMachinery) {
      setMachineNumberOptions([]);
      return;
    }

    const machineryObj = machineryList.find(m => m.machinery_name === lastSelectedMachinery);
    if (!machineryObj) {
      setMachineNumberOptions([]);
      return;
    }

    axios.get(`http://localhost:8081/machine-numbers?machinery_id=${machineryObj.id}`)
      .then((res) => setMachineNumberOptions(res.data))
      .catch((err) => console.error('Error fetching machine numbers:', err));
  }, [lastSelectedMachinery, machineryList]);

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
    if (!selectedDate || !selectedDepartment || !lastSelectedMachinery || !typeOfWork) {
      setSnackbar({ open: true, message: "Please fill all required fields.", severity: 'error' });
      return;
    }

    const payload = {
      date: selectedDate,
      department: selectedDepartment,
      equipment: lastSelectedMachinery, // maintenance record table still uses the "equipment" column
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
        Equipment Maintenance
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
              onChange={(e) => {
                setSelectedDepartment(e.target.value);
                setSelectedMachinery([]);
                setLastSelectedMachinery(null);
              }}
            >
              <MenuItem value=""><em>Select Department</em></MenuItem>
              {departments.map((dept) => (
                <MenuItem key={dept.dept_Id} value={dept.dept_Name}>
                  {dept.dept_Name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl sx={{ flex: '1 1 200px' }} disabled={!selectedDepartment}>
            <InputLabel id="machinery-label">Machinery</InputLabel>
            <Select
              labelId="machinery-label"
              multiple
              label="Machinery"
              open={machineryDropdownOpen}
              onOpen={() => setMachineryDropdownOpen(true)}
              onClose={() => setMachineryDropdownOpen(false)}
              value={selectedMachinery}
              onChange={(e) => {
                const selected = e.target.value;
                const latest = selected[selected.length - 1];
                setSelectedMachinery(selected);
                setLastSelectedMachinery(latest);
                setMachineryDropdownOpen(false);
              }}
              renderValue={(selected) => selected.join(', ')}
            >
              {machineryList.map((machinery) => (
                <MenuItem key={machinery.id} value={machinery.machinery_name}>
                  <Checkbox checked={selectedMachinery.includes(machinery.machinery_name)} />
                  {machinery.machinery_name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl sx={{ flex: '1 1 200px' }} disabled={!lastSelectedMachinery}>
            <InputLabel id="machine-number-label">Machine Number</InputLabel>
            <Select
              labelId="machine-number-label"
              value={selectedMachineNumber}
              label="Machine Number"
              onChange={(e) => setSelectedMachineNumber(e.target.value)}
            >
              <MenuItem value=""><em>Select Machine Number</em></MenuItem>
              {machineNumberOptions.map((mn) => (
                <MenuItem key={mn.id} value={mn.machine_number}>
                  {mn.machine_number}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl sx={{ flex: '1 1 200px' }}>
            <InputLabel id="category-label">Category</InputLabel>
            <Select
              labelId="category-label"
              value={selectedCategory}
              label="Category"
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <MenuItem value=""><em>Select Category</em></MenuItem>
              {categories.map((cat) => (
                <MenuItem key={cat.id} value={cat.category_name}>
                  {cat.category_name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Box>

      <Box sx={{ maxWidth: 1200, mx: 'auto', mt: 4, p: 2, bgcolor: '#FEFBF6', borderRadius: 3, boxShadow: 4 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, color: '#000B58' }}>
          <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
            <FormControl sx={{ flex: '1 1 200px' }}>
              <InputLabel id="type-of-work-label">Type of Work</InputLabel>
              <Select
                labelId="type-of-work-label"
                value={typeOfWork}
                label="Type of Work"
                onChange={(e) => setTypeOfWork(e.target.value)}
              >
                <MenuItem value=""><em>Select Type of Work</em></MenuItem>
                {TYPE_OF_WORK_OPTIONS.map((opt) => (
                  <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              sx={{ flex: '2 1 300px' }}
              label="Work Details"
              value={workDetails}
              onChange={(e) => setWorkDetails(e.target.value)}
            />

            {/* HRS: dropdown of 1/2/3, but freeSolo lets the user type any custom value */}
            <Autocomplete
              freeSolo
              sx={{ flex: '1 1 150px' }}
              options={HRS_OPTIONS}
              value={hrs}
              onChange={(e, newValue) => handleHrsChange(newValue ?? '')}
              onInputChange={(e, newInputValue) => handleHrsChange(newInputValue)}
              renderInput={(params) => (
                <TextField {...params} label="HRS" />
              )}
            />

            {/* Amount: auto-fills from HRS × rate, but stays freely editable */}
            <TextField
              sx={{ flex: '1 1 150px' }}
              label="Amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              helperText={`Auto: HRS × ₹${RATE_PER_HOUR}`}
            />
          </Box>

          <TextField
            label="Remark"
            value={remark}
            onChange={(e) => setRemark(e.target.value)}
            multiline
            minRows={2}
          />

          <Box>
            <Button variant="contained" onClick={handleSave}>
              Save
            </Button>
          </Box>
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