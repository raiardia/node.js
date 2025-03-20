import http from "http";
import mysql from "mysql2";

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  database: "openApi",
  password: "",
});

db.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err.stack);
    return;
  }
  console.log("Connected to database");
});

const server = http.createServer((req, res) => {
  
  db.query("SELECT * FROM users", (err, result) => {
    if (err) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Internal server error" }));
      return;
    }

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(result));
  });
});

server.listen(3000, () =>
  console.log("Server is running on http://localhost:3000")
);
