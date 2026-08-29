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
    console.error("Login query error:", err);
    if (results.length === 0) return res.status(401).json({ error: "Invalid credentials" });
    const user = results[0];
    res.json({ id: user.id, username: user.username, role: user.role });
  });
});

// ✔ Department Management
app.get('/departments', (req, res) => {
  db.query("SELECT * FROM department_name", (err, data) => {
    if (err) return res.status(500).json(err);
    res.json(data);
  });
});

app.post('/departments', (req, res) => {
  const { dept_Name, remark } = req.body;
  if (!dept_Name) return res.status(400).json({ message: "Department name is required" });
  const sql = "INSERT INTO department_name (dept_Name, remark) VALUES (?, ?)";
  db.query(sql, [dept_Name, remark || ''], (err, result) => {
    if (err) return res.status(500).json(err);
    res.status(201).json({ id: result.insertId, dept_Name, remark: remark || '' });
  });
});

app.put('/departments/:id', (req, res) => {
  const { id } = req.params;
  const { dept_Name, remark } = req.body;
  if (!dept_Name) return res.status(400).json({ message: "Department name is required" });
  const sql = "UPDATE department_name SET dept_Name = ?, remark = ? WHERE dept_Id = ?";
  db.query(sql, [dept_Name, remark || '', id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Department updated successfully" });
  });
});

app.delete('/departments/:id', (req, res) => {
  const { id } = req.params;
  const sql = "DELETE FROM department_name WHERE dept_Id = ?";
  db.query(sql, [id], (err, result) => {
    if (err) return res.status(500).json(err);
    if (result.affectedRows === 0) return res.status(404).json({ message: "Department not found" });
    res.json({ message: "Department deleted successfully" });
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

// ✔ Machinery Management (filtered by department, not section)
app.get('/machinery', (req, res) => {
  const { department_id } = req.query;
  if (!department_id) return res.status(400).json({ error: "Missing department_id parameter" });
  const sql = "SELECT * FROM machinery_name WHERE department_id = ?";
  db.query(sql, [department_id], (err, results) => {
    if (err) return res.status(500).json({ error: "Database error", details: err });
    res.json(results);
  });
});

app.post('/machinery', (req, res) => {
  const { machinery_name, department_id } = req.body;
  if (!machinery_name) return res.status(400).json({ message: "Machinery name is required" });
  const sql = "INSERT INTO machinery_name (machinery_name, department_id) VALUES (?, ?)";
  db.query(sql, [machinery_name, department_id || null], (err, result) => {
    if (err) return res.status(500).json({ error: "Database error", details: err });
    res.status(201).json({ message: "Machinery added", id: result.insertId });
  });
});

app.delete('/machinery/:id', (req, res) => {
  const { id } = req.params;
  const sql = "DELETE FROM machinery_name WHERE id = ?";
  db.query(sql, [id], (err, result) => {
    if (err) return res.status(500).json({ error: "Database error", details: err });
    if (result.affectedRows === 0) return res.status(404).json({ message: "Machinery not found" });
    res.json({ message: "Machinery deleted successfully" });
  });
});

// ✔ Category Management (independent master list)
app.get('/categories', (req, res) => {
  db.query("SELECT * FROM category ORDER BY category_name", (err, data) => {
    if (err) return res.status(500).json(err);
    res.json(data);
  });
});

// ✔ Machine Number Management (linked to a specific machinery_id)
app.get('/machine-numbers', (req, res) => {
  const { machinery_id } = req.query;
  if (!machinery_id) return res.status(400).json({ error: "Missing machinery_id parameter" });
  const sql = "SELECT * FROM machine_number WHERE machinery_id = ?";
  db.query(sql, [machinery_id], (err, results) => {
    if (err) return res.status(500).json({ error: "Database error", details: err });
    res.json(results);
  });
});

app.post('/machine-numbers', (req, res) => {
  const { machine_number, machinery_id } = req.body;
  if (!machine_number || !machinery_id) {
    return res.status(400).json({ message: "machine_number and machinery_id are required" });
  }
  const sql = "INSERT INTO machine_number (machine_number, machinery_id) VALUES (?, ?)";
  db.query(sql, [machine_number, machinery_id], (err, result) => {
    if (err) return res.status(500).json({ error: "Database error", details: err });
    res.status(201).json({ message: "Machine number added", id: result.insertId });
  });
});

app.delete('/machine-numbers/:id', (req, res) => {
  const { id } = req.params;
  const sql = "DELETE FROM machine_number WHERE id = ?";
  db.query(sql, [id], (err, result) => {
    if (err) return res.status(500).json({ error: "Database error", details: err });
    if (result.affectedRows === 0) return res.status(404).json({ message: "Machine number not found" });
    res.json({ message: "Machine number deleted successfully" });
  });
});

// ✔ Maintenance Records
app.post('/maintenance-records', (req, res) => {
  const {
    date, department, equipment, machine_number, category,
    type_of_work, work_details, hrs, amount, remark
  } = req.body;

  if (!date || !department || !equipment || !type_of_work) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const sql = `
    INSERT INTO \`maintenance record\` (
      \`date\`, department, equipment, machine_number, category,
      type_of_work, work_details, hrs, amount, remark
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    date, department, equipment, machine_number || '', category || '',
    type_of_work, work_details || '', hrs || 1, amount || 0, remark || ''
  ];

  db.query(sql, values, (err, result) => {
    if (err) return res.status(500).json({ message: "Database error", error: err });
    res.status(201).json({ message: "Maintenance record added", id: result.insertId });
  });
});

app.get('/maintenance-records', (req, res) => {
  db.query('SELECT * FROM `maintenance record`', (err, results) => {
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