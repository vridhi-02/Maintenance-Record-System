const express = require('express');
const mysql = require('mysql');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// MySQL connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'eqmaintenance'
});

// ✔ User Management
app.get('/users', (req, res) => {
  db.query("SELECT * FROM users", (err, data) => {
    if (err) return res.status(500).json(err);
    res.json(data);
  });
});

app.post('/users', (req, res) => {
  const { username, password, role } = req.body;
  if (!username || !password || !role) {
    return res.status(400).json({ message: "Missing fields" });
  }
  const sql = "INSERT INTO users (username, password, role) VALUES (?, ?, ?)";
  db.query(sql, [username, password, role], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "User/Admin added", id: result.insertId });
  });
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const sql = "SELECT * FROM users WHERE username = ? AND password = ?";
  db.query(sql, [username, password], (err, results) => {
    if (err) return res.status(500).json({ error: "Server error" });
    if (results.length === 0) return res.status(401).json({ error: "Invalid credentials" });
    const user = results[0];
    res.json({ id: user.id, username: user.username, role: user.role });
  });
});

// ✔ Section Management
app.get('/sections', (req, res) => {
  db.query("SELECT * FROM section", (err, data) => {
    if (err) return res.status(500).json(err);
    res.json(data);
  });
});

app.post('/sections', (req, res) => {
  const { section_name } = req.body;
  if (!section_name) return res.status(400).json({ message: "Section name is required" });
  const sql = "INSERT INTO section (section_name) VALUES (?)";
  db.query(sql, [section_name], (err, result) => {
    if (err) return res.status(500).json(err);
    res.status(201).json({ id: result.insertId, section_name });
  });
});

app.put('/sections/:id', (req, res) => {
  const { id } = req.params;
  const { section_name } = req.body;
  if (!section_name) return res.status(400).json({ message: "Section name is required" });
  const sql = "UPDATE section SET section_name = ? WHERE id = ?";
  db.query(sql, [section_name, id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Section updated successfully" });
  });
});

app.delete('/sections/:id', (req, res) => {
  const { id } = req.params;
  const sql = "DELETE FROM section WHERE id = ?";
  db.query(sql, [id], (err, result) => {
    if (err) return res.status(500).json(err);
    if (result.affectedRows === 0) return res.status(404).json({ message: "Section not found" });
    res.json({ message: "Section deleted successfully" });
  });
});

// ✔ Equipment Management
app.get('/equipment', (req, res) => {
  let { section_id } = req.query;
  if (!section_id) return res.status(400).json({ error: "Missing section_id parameter" });
  if (!Array.isArray(section_id)) section_id = [section_id];
  const placeholders = section_id.map(() => '?').join(',');
  const sql = `SELECT * FROM equipment WHERE section_id IN (${placeholders})`;
  db.query(sql, section_id, (err, results) => {
    if (err) return res.status(500).json({ error: "Database error", details: err });
    res.json(results);
  });
});

app.post('/equipment', (req, res) => {
  const { equipment_name, section_id } = req.body;
  if (!equipment_name || !section_id) return res.status(400).json({ message: "Fields are required" });
  const sql = "INSERT INTO equipment (equipment_name, section_id) VALUES (?, ?)";
  db.query(sql, [equipment_name, section_id], (err, result) => {
    if (err) return res.status(500).json({ error: "Database error", details: err });
    res.status(201).json({ message: "Equipment added", id: result.insertId });
  });
});

app.delete('/equipment/:id', (req, res) => {
  const { id } = req.params;
  const sql = "DELETE FROM equipment WHERE id = ?";
  db.query(sql, [id], (err, result) => {
    if (err) return res.status(500).json({ error: "Database error", details: err });
    if (result.affectedRows === 0) return res.status(404).json({ message: "Equipment not found" });
    res.json({ message: "Equipment deleted successfully" });
  });
});

// ✔ Maintenance Records (PM & CM)
app.post('/maintenance-records', (req, res) => {
  const {
    date, section, equipment, type,
    issue_description, action_taken, remark,
    frequency, task_description, details,
    technician_name
  } = req.body;

  if (!date || !section || !equipment || !type || !technician_name) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  if (type === 'CM' && (!issue_description || !action_taken || !remark)) {
    return res.status(400).json({ message: "Missing CM fields" });
  }

  if (type === 'PM' && (!frequency || !task_description || !details)) {
    return res.status(400).json({ message: "Missing PM fields" });
  }

  const sql = `
    INSERT INTO \`maintenance record\` (
      \`date\`, section, equipment, \`type\`,
      issue_description, action_taken, remark,
      frequency, task_description, details, technician_name
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    date, section, equipment, type,
    issue_description || '', action_taken || '', remark || '',
    frequency || '', task_description || '', details || '',
    technician_name
  ];

  db.query(sql, values, (err, result) => {
    if (err) return res.status(500).json({ message: "Database error", error: err });
    res.status(201).json({ message: "Maintenance record added", id: result.insertId });
  });
});

app.get('/maintenance-records', (req, res) => {
  const { type } = req.query;
  const sql = type
    ? 'SELECT * FROM `maintenance record` WHERE type = ?'
    : 'SELECT * FROM `maintenance record`';
  db.query(sql, type ? [type] : [], (err, results) => {
    if (err) return res.status(500).json({ message: "Database error", error: err });
    res.json(results);
  });
});

// ✔ Equipment Name table
app.post('/equipment-name', (req, res) => {
  const {
    equipment_name, make_brand, model_number, serial_number,
    date_of_purchase, location, price, AMC_Detail,
    warranty_expiry, last_service_date, next_service_due,
    vendor_contact_name, remark
  } = req.body;

  const sql = `
    INSERT INTO \`equipment name\`
    (equipment_name, make_brand, model_number, serial_number,
     date_of_purchase, location, price, AMC_Detail,
     warranty_expiry, last_service_date, next_service_due,
     vendor_contact_name, remark)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    equipment_name, make_brand, model_number, serial_number,
    date_of_purchase, location, price, AMC_Detail,
    warranty_expiry, last_service_date, next_service_due,
    vendor_contact_name, remark
  ];

  db.query(sql, values, (err, result) => {
    if (err) return res.status(500).json({ message: "Database error", error: err });
    res.status(201).json({ message: "Equipment name record added", id: result.insertId });
  });
});

app.post('/equipment-name-data', (req, res) => {
  const { names } = req.body;
  if (!Array.isArray(names) || names.length === 0) {
    return res.status(400).json({ message: "Equipment names are required" });
  }
  const placeholders = names.map(() => '?').join(',');
  const sql = `SELECT * FROM \`equipment name\` WHERE equipment_name IN (${placeholders})`;
  db.query(sql, names, (err, results) => {
    if (err) return res.status(500).json({ message: "Database error", error: err });
    res.json(results);
  });
});

app.put('/equipment-name/:name', (req, res) => {
  const name = req.params.name;
  const fields = req.body;
  const columns = Object.keys(fields).map(key => `\`${key}\` = ?`).join(', ');
  const values = Object.values(fields);
  const sql = `UPDATE \`equipment name\` SET ${columns} WHERE equipment_name = ?`;
  db.query(sql, [...values, name], (err) => {
    if (err) return res.status(500).json({ message: 'Update failed', error: err });
    res.json({ message: 'Equipment updated successfully' });
  });
});
app.post('/add-equipment', (req, res) => {
  const data = req.body;
  const sql = `INSERT INTO \`equipment name\` SET ?`;
  db.query(sql, data, (err, result) => {
    if (err) {
      console.error("Insert error:", err); // Helpful debug log
      return res.status(500).send({ message: 'Insert failed', error: err });
    }
    res.send({ message: 'Inserted', id: result.insertId });
  });
});
// ✔ Get all water testing records
app.get('/water-testing', (req, res) => {
  const sql = "SELECT * FROM `water testing` ORDER BY Date DESC";
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ message: "Database error", error: err });
    res.json(results);
  });
});

// ✔ Add a new water testing record
app.post('/water-testing', (req, res) => {
  const { Date, Location_testpoint, TDS, hardness, Comments_actiontaken, Remark } = req.body;

  if (!Date || !Location_testpoint || !TDS || !hardness) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const sql = `
    INSERT INTO \`water testing\` 
    (Date, Location_testpoint, TDS, hardness, Comments_actiontaken, Remark)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [Date, Location_testpoint, TDS, hardness, Comments_actiontaken || "", Remark || ""],
    (err, result) => {
      if (err) return res.status(500).json({ message: "Database error", error: err });
      res.status(201).json({ message: "Water test record added", id: result.insertId });
    }
  );
});


app.listen(8081, () => {
  console.log("Server running on 8081");
});
