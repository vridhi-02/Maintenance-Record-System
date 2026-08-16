import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Snackbar,
  Alert,
} from "@mui/material";

export default function WaterTesting() {
  const [form, setForm] = useState({
    Date: "",
    Location_testpoint: "",
    TDS: "",
    hardness: "",   
    Comments_actiontaken: "",
    Remark: "",
  });

  const [records, setRecords] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  useEffect(() => {
    fetch("http://localhost:8081/water-testing")
      .then((res) => res.json())
      .then((data) => setRecords(data))
      .catch((err) => console.error("Fetch error:", err));
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.Date || !form.Location_testpoint || !form.TDS || !form.hardness) {
      alert("Please fill all required fields.");
      return;
    }

    fetch("http://localhost:8081/water-testing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
      .then((res) => res.json())
      .then((data) => {
        setRecords([{ ...form, id: data.id }, ...records]); // prepend new record
        setForm({
          Date: "",
          Location_testpoint: "",
          TDS: "",
          hardness: "",
          Comments_actiontaken: "",
          Remark: "",
        });
        setSnackbarOpen(true);
      })
      .catch((err) => console.error("Submit error:", err));
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString)
      .toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
      })
      .replaceAll("/", "-"); 
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Heading */}
      <Typography variant="h5" align="center" gutterBottom color="#872341">
        Water Testing
      </Typography>

      {/* Form */}
      <Paper sx={{ p: 3, mb: 4, borderRadius: 2, boxShadow: 2 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Record New Test
        </Typography>
        <form onSubmit={handleSubmit}>
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
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
            <TextField
              label="Location / Test Point"
              name="Location_testpoint"
              value={form.Location_testpoint}
              onChange={handleChange}
              fullWidth
              required
            />
            <TextField
              label="TDS (ppm)"
              name="TDS"
              value={form.TDS}
              onChange={handleChange}
              type="number"
              fullWidth
              required
            />
            <TextField
              label="Hardness (mg/L)"
              name="hardness"
              value={form.hardness}
              onChange={handleChange}
              type="number"
              fullWidth
              required
            />
            <TextField
              label="Comments / Action Taken"
              name="Comments_actiontaken"
              value={form.Comments_actiontaken}
              onChange={handleChange}
              multiline
              rows={2}
              fullWidth
            />
            <TextField
              label="Remarks"
              name="Remark"
              value={form.Remark}
              onChange={handleChange}
              multiline
              rows={2}
              fullWidth
            />
          </Box>
          <Button
            type="submit"
            variant="contained"
            sx={{
              mt: 2,
              backgroundColor: "#3498db",
              "&:hover": { backgroundColor: "#2980b9" },
            }}
          >
            Save Test Record
          </Button>
        </form>
      </Paper>

      {/* Records Table */}
      <Paper sx={{ p: 2, borderRadius: 2, boxShadow: 2 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Test Records
        </Typography>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Location / Test Point</TableCell>
              <TableCell>TDS (ppm)</TableCell>
              <TableCell>Hardness (mg/L)</TableCell>
              <TableCell>Comments / Action Taken</TableCell>
              <TableCell>Remarks</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {records.length > 0 ? (
              records.map((row) => (
                <TableRow key={row.id || row.Date + row.Location_testpoint}>
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
                <TableCell colSpan={6} align="center">
                  No records found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>

      {/* Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={2000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity="success" sx={{ width: "100%" }}>
          Water Test Record Added!
        </Alert>
      </Snackbar>
    </Box>
  );
}
