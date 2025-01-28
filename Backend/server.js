// Importálások 
require('dotenv').config();
const cors = require('cors');
const express = require('express');
const { v4: uuidv4 } = require('uuid'); // UUID importálása
const CryptoJS = require('crypto-js'); // CryptoJS importálása
const mysql = require('mysql');

const app = express();

// Adatbázis kapcsolat pool létrehozása
const pool = mysql.createPool({
  connectionLimit: 10,
  host: process.env.DBHOST,
  user: process.env.DBUSER,
  password: process.env.DBPASS,
  database: process.env.DBNAME
});

// Middleware-k
app.use(cors());
app.use(express.json());

// Jelszó validáló függvény
const validatePassword = (password) => {
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/;
  return regex.test(password);
};

// Felhasználók listázása
app.get('/users', (req, res) => {
  pool.query('SELECT * FROM users', (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Adatbázis hiba' });
    }
    res.json(results);
  });
});

// Egy felhasználó lekérdezése ID alapján
app.get('/users/:id', (req, res) => {
  const { id } = req.params;
  pool.query('SELECT * FROM users WHERE id = ?', [id], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Adatbázis hiba' });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'Felhasználó nem található' });
    }
    res.json(results[0]);
  });
});

// Új felhasználó hozzáadása
app.post('/users', (req, res) => {
  const { name, email, password, role, picture_id } = req.body;

  // Jelszó validálása
  if (!validatePassword(password)) {
    return res.status(400).json({
      error: 'A jelszónak legalább 8 karakter hosszúnak kell lennie, tartalmaznia kell kis- és nagybetűket, valamint legalább egy számot.',
    });
  }

  // Jelszó titkosítása SHA-1 algoritmussal
  const hashedPassword = CryptoJS.SHA1(password).toString();

  const id = uuidv4(); // UUID generálása
  const sql = 'INSERT INTO users (id, name, email, password, role, picture_id) VALUES (?, ?, ?, ?, ?, ?)';
  const values = [id, name, email, hashedPassword, role, picture_id];

  pool.query(sql, values, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Adatbázis hiba' });
    }
    res.status(201).json({ message: 'Felhasználó sikeresen hozzáadva', id });
  });
});

// Felhasználó frissítése ID alapján
app.put('/users/:id', (req, res) => {
  const { id } = req.params;
  const { name, email, password, role, picture_id } = req.body;

  // Jelszó validálása, ha meg van adva
  let hashedPassword = null;
  if (password) {
    if (!validatePassword(password)) {
      return res.status(400).json({
        error: 'A jelszónak legalább 8 karakter hosszúnak kell lennie, tartalmaznia kell kis- és nagybetűket, valamint legalább egy számot.',
      });
    }
    hashedPassword = CryptoJS.SHA1(password).toString();
  }

  const sql = 'UPDATE users SET name = ?, email = ?, password = ?, role = ?, picture_id = ? WHERE id = ?';
  const values = [name, email, hashedPassword || password, role, picture_id, id];

  pool.query(sql, values, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Adatbázis hiba' });
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'Felhasználó nem található' });
    }
    res.json({ message: 'Felhasználó sikeresen frissítve' });
  });
});

// Felhasználó törlése ID alapján
app.delete('/users/:id', (req, res) => {
  const { id } = req.params;
  pool.query('DELETE FROM users WHERE id = ?', [id], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Adatbázis hiba' });
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'Felhasználó nem található' });
    }
    res.json({ message: 'Felhasználó sikeresen törölve' });
  });
});

// Szerver indítása
app.listen(process.env.PORT, () => {
  console.log('Server: http://localhost:' + process.env.PORT);
});
