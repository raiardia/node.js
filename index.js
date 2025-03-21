import express from "express"; // Mengimpor modul Express untuk membuat server
import mysql from "mysql2"; // Mengimpor modul mysql2 untuk berinteraksi dengan database MySQL
import swaggerUi from "swagger-ui-express"; // Mengimpor Swagger UI untuk dokumentasi API
import fs from "fs"; // Mengimpor modul fs untuk membaca file
import YAML from "yaml"; // Mengimpor modul YAML untuk parsing file OpenAPI

// Membaca dan mem-parsing file OpenApi.yml untuk dokumentasi API
const swaggerDocument = YAML.parse(fs.readFileSync("./OpenApi.yml", "utf8"));

// Membuat koneksi ke database MySQL
const db = mysql.createConnection({
  host: "localhost", // Host database
  user: "root", // Username database
  database: "open_api", // Nama database
  password: "", // Password database (kosong untuk default)
});

const app = express(); // Membuat aplikasi Express
app.use(express.json()); // Middleware untuk parsing JSON
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument)); // Menyediakan dokumentasi API menggunakan Swagger UI

// Endpoint untuk mendapatkan semua pengguna
app.get("/users", (req, res) => {
  db.query("SELECT * FROM user", (err, results) => {
    if (err) {
      res.status(500).send("Internal Server Error"); // Jika terjadi error, kirim status 500
      return;
    }
    res.json(results); // Mengembalikan data pengguna dalam format JSON
  });
});

// Endpoint untuk mendapatkan satu pengguna berdasarkan ID
app.get("/users/:id", (req, res) => {
  const userId = req.params.id; // Mengambil ID dari parameter URL
  db.query("SELECT * FROM user WHERE id = ?", [userId], (err, results) => {
    if (err) {
      res.status(500).send("Internal Server Error");
      return;
    }
    if (results.length === 0) {
      res.status(404).send("User not found"); // Jika tidak ditemukan, kirim status 404
      return;
    }
    res.json(results[0]); // Mengembalikan data pengguna
  });
});

// Endpoint untuk menambahkan pengguna baru
app.post("/users", (req, res) => {
  const { name, email, age } = req.body; // Mengambil data dari body request
  if (!name || !email || age === undefined) {
    res.status(400).send("Name, Email, and Age are required"); // Validasi input
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
      res.status(201).json({ id: result.insertId, name, email, age }); // Mengembalikan data pengguna yang baru ditambahkan
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
        res.status(404).send("User not found"); // Jika tidak ditemukan, kirim status 404
        return;
      }
      res.json({ id: userId, name, email, age }); // Mengembalikan data pengguna yang diperbarui
    }
  );
});

// Endpoint untuk menghapus pengguna berdasarkan ID
app.delete("/users/:id", (req, res) => {
  const userId = req.params.id;
  db.query("DELETE FROM user WHERE id = ?", [userId], (err, result) => {
    if (err) {
      res.status(500).send("Internal Server Error");
      return;
    }
    if (result.affectedRows === 0) {
      res.status(404).send("User not found"); // Jika tidak ditemukan, kirim status 404
      return;
    }
    res.json({ message: "User deleted successfully" }); // Mengembalikan pesan bahwa pengguna berhasil dihapus
  });
});

// Menjalankan server di port 3000
app.listen(3000, () => console.log("Server berjalan di http://localhost:3000"));
