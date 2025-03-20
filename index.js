import express from "express";
import mysql from "mysql2";
import swaggerUi from "swagger-ui-express";
import fs from 'fs';
import YAML from 'yaml';

const swaggerDocument = YAML.parse(fs.readFileSync('./openapi/spec.yaml', 'utf8'));

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  database: "openApi",
  password: "",
});

const app = express();

app.get("/users", (req, res) => {
  db.query("SELECT * FROM users", (err, result) => {
    if (err) {
      res.end("Internal server error" );
      return;
    }
    res.json(result);
  });
});

app.listen(3000, () =>
  console.log("Server is running on http://localhost:3000")
);
