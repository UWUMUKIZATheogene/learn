const express = require("express");
const cors = require("cors");
require("dotenv").config();
const db = require("./db");

const app = express();
const PORT = Number(process.env.PORT || 5000);

app.use(cors({ origin: process.env.FRONTEND_ORIGIN || "http://127.0.0.1:5500" }));
app.use(express.json());

app.get("/", (req, res) => res.json({ message: "StudentHub API is running" }));

app.get("/api/students", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT id, student_id, name, email, class_name, status, created_at FROM students ORDER BY id DESC"
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not retrieve students" });
  }
});

app.get("/api/students/:id", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT id, student_id, name, email, class_name, status, created_at FROM students WHERE id = ?",
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ message: "Student not found" });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not retrieve student" });
  }
});

app.post("/api/students", async (req, res) => {
  const { student_id, name, email, class_name, status } = req.body;
  const values = [student_id, name, email, class_name, status];
  if (!values.every(v => typeof v === "string" && v.trim())) {
    return res.status(400).json({ message: "All student fields are required" });
  }
  if (!["Active", "Inactive"].includes(status)) {
    return res.status(400).json({ message: "Status must be Active or Inactive" });
  }
  try {
    const [result] = await db.query(
      "INSERT INTO students (student_id, name, email, class_name, status) VALUES (?, ?, ?, ?, ?)",
      values.map(v => v.trim())
    );
    const [rows] = await db.query(
      "SELECT id, student_id, name, email, class_name, status, created_at FROM students WHERE id = ?",
      [result.insertId]
    );
    res.status(201).json({ message: "Student added successfully", student: rows[0] });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") return res.status(409).json({ message: "Student ID or email already exists" });
    console.error(err);
    res.status(500).json({ message: "Could not add student" });
  }
});

app.put("/api/students/:id", async (req, res) => {
  const { student_id, name, email, class_name, status } = req.body;
  const values = [student_id, name, email, class_name, status];
  if (!values.every(v => typeof v === "string" && v.trim())) {
    return res.status(400).json({ message: "All student fields are required" });
  }
  if (!["Active", "Inactive"].includes(status)) {
    return res.status(400).json({ message: "Status must be Active or Inactive" });
  }
  try {
    const [result] = await db.query(
      "UPDATE students SET student_id=?, name=?, email=?, class_name=?, status=? WHERE id=?",
      [...values.map(v => v.trim()), req.params.id]
    );
    if (!result.affectedRows) return res.status(404).json({ message: "Student not found" });
    const [rows] = await db.query(
      "SELECT id, student_id, name, email, class_name, status, created_at FROM students WHERE id=?",
      [req.params.id]
    );
    res.json({ message: "Student updated successfully", student: rows[0] });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") return res.status(409).json({ message: "Student ID or email already exists" });
    console.error(err);
    res.status(500).json({ message: "Could not update student" });
  }
});

app.delete("/api/students/:id", async (req, res) => {
  try {
    const [result] = await db.query("DELETE FROM students WHERE id=?", [req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ message: "Student not found" });
    res.json({ message: "Student deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not delete student" });
  }
});

async function start() {
  try {
    const connection = await db.getConnection();
    connection.release();
    console.log("Connected to MySQL database.");
    app.listen(PORT, () => console.log(`StudentHub API running at http://localhost:${PORT}`));
  } catch (err) {
    console.error("MySQL connection failed:", err.message);
    console.error("Check MySQL is running and your .env settings are correct.");
    process.exit(1);
  }
}
start();
