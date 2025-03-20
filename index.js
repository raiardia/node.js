import express from "express";
import mysql from "mysql2";
import swaggerUi from "swagger-ui-express";
import fs from "fs";
import YAML from "yaml";

const swaggerDocument = YAML.parse(fs.readFileSync("./OpenApi.yml", "utf8"));

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  database: "open_api",
  password: "",
});

const app = express();
app.use(express.json()); // Middleware untuk parsing JSON
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Mendapatkan semua pengguna
app.get("/users", (req, res) => {
  db.query("SELECT * FROM user", (err, results) => {
    if (err) {
      res.status(500).send("Internal Server Error");
      return;
    }
    res.json(results);
  });
});

// Mendapatkan satu pengguna berdasarkan ID
app.get("/users/:id", (req, res) => {
  const userId = req.params.id;
  db.query("SELECT * FROM user WHERE id = ?", [userId], (err, results) => {
    if (err) {
      res.status(500).send("Internal Server Error");
      return;
    }
    if (results.length === 0) {
      res.status(404).send("User not found");
      return;
    }
    res.json(results[0]);
  });
});

// Menambahkan pengguna baru
app.post("/users", (req, res) => {
  const { name, email, age } = req.body;
  if (!name || !email || age === undefined) {
    res.status(400).send("Name, Email, and Age are required");
    return;
  }
  db.query(
    "INSERT INTO user (name, email, age, createdAt, updatedAt) VALUES (?, ?, ?, NOW(), NOW())",
    [name, email, age],
    (err, result) => {
      if (err) {
        console.error("Database Error:", err);
        res.status(500).send("Internal Server Error");
        return;
      }
      res.status(201).json({ id: result.insertId, name, email, age });
    }
  );
});

// Memperbarui data pengguna berdasarkan ID
app.put("/users/:id", (req, res) => {
  const userId = req.params.id;
  const { name, email, age } = req.body;
  if (!name || !email || age === undefined) {
    res.status(400).send("Name, Email, and Age are required");
    return;
  }
  db.query(
    "UPDATE user SET name = ?, email = ?, age = ?, updatedAt = NOW() WHERE id = ?",
    [name, email, age, userId],
    (err, result) => {
      if (err) {
        console.error("Database Error:", err);
        res.status(500).send("Internal Server Error");
        return;
      }
      if (result.affectedRows === 0) {
        res.status(404).send("User not found");
        return;
      }
      res.json({ id: userId, name, email, age });
    }
  );
});

// Menghapus pengguna berdasarkan ID
app.delete("/users/:id", (req, res) => {
  const userId = req.params.id;
  db.query("DELETE FROM user WHERE id = ?", [userId], (err, result) => {
    if (err) {
      res.status(500).send("Internal Server Error");
      return;
    }
    if (result.affectedRows === 0) {
      res.status(404).send("User not found");
      return;
    }
    res.json({ message: "User deleted successfully" });
  });
});

app.listen(3000, () => console.log("Server berjalan di http://localhost:3000"));
