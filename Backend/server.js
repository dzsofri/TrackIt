require('dotenv').config();
const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');  // bcrypt könyvtár importálása

const uuid = require('uuid');
const { v4: uuidv4 } = require('uuid');  // UUID generálása


const app = express();
const PORT = process.env.PORT || 3000;
const SECRET_KEY = process.env.JWT_SECRET;  // Korrekt környezeti változó használata

app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: process.env.DBHOST,
  user: process.env.DBUSER,
  password: process.env.DBPASS,
  database: process.env.DBNAME
});

db.connect(err => {
    if (err) {
        console.error('Database connection failed:', err);
        return;
    }
    console.log('Connected to MySQL database');
});

// Middleware a token ellenőrzéshez
function tokencheck(req, res, next){
  const authHeader = req.header('Authorization');
  if (!authHeader) return res.status(400).send('Jelentkezz be!');

  const token = authHeader.split(' ')[1];
  try{
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();  
  }catch(error){
    res.status(400).send('Hibás authentikáció!');
  }
}

// Bejelentkezés (Token generálás)
app.post('/login', (req, res) => {
    const { email, password } = req.body;
    
    db.query('SELECT * FROM users WHERE email = ?', [email], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.length === 0) return res.status(401).json({ error: 'Invalid credentials' });

        const user = result[0];
        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) return res.status(500).json({ error: err.message });
            if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

            const token = jwt.sign({ id: user.id, email: user.email }, SECRET_KEY, { expiresIn: '1h' });
            res.json({ token });
        });
    });
});




// Új felhasználó regisztrációja
app.post('/reg/users', (req, res) => {
  console.log("Request body:", req.body);

  const { name, email, password, confirm } = req.body;
  console.log(req.body);

  // Jelszó ellenőrzése: legalább 8 karakter, tartalmaz kis- és nagybetűt, valamint számot
  const passwordRegExp = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/;
  if (!passwordRegExp.test(password)) {
      return res.status(400).json({ 
          error: 'A jelszónak legalább 8 karakter hosszúnak kell lennie, tartalmaznia kell kis- és nagybetűket, valamint legalább egy számot.' 
      });
  }

  // Ellenőrizzük, hogy minden szükséges mező kitöltésre került-e
  if (!name || !email || !password || !confirm) {
      return res.status(400).json({ message: 'Hiányzó adatok!' });
  }

  // Ellenőrizzük, hogy a jelszavak egyeznek-e
  if (password !== confirm) {
      return res.status(400).json({ message: 'A megadott jelszavak nem egyeznek!' });
  }

  // Ellenőrizzük, hogy létezik-e már ilyen e-mail cím
  db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
      if (err) {
          return res.status(500).json({ error: err.message });
      }

      if (results.length > 0) {
          return res.status(400).json({ message: 'Ez az e-mail cím már regisztrálva van!' });
      }

      // Titkosítjuk a jelszót bcrypt-tel
      bcrypt.hash(password, 10, (err, hashedPassword) => {
          if (err) {
              return res.status(500).json({ error: err.message });
          }

          // UUID generálása és szerepkör hozzáadása
          const id = uuidv4();  // UUID generálása a felhasználó számára
          const role = 'user';   // Alapértelmezett szerepkör

          // Generálunk egy egyedi JWT titkot (secret)
          const secret = jwt.sign({ id, email }, SECRET_KEY, { expiresIn: '1h' });

          // Új felhasználó beszúrása az adatbázisba
          db.query(
              'INSERT INTO users (id, name, email, password, role, secret) VALUES (?, ?, ?, ?, ?, ?)',
              [id, name, email, hashedPassword, role, secret], // Titkos token a `secret` mezőben
              (err, result) => {
                  if (err) {
                      return res.status(500).json({ error: err.message });
                  }
                  return res.status(200).json({ message: 'Sikeres regisztráció!' });
              }
          );
      });
  });
});

// Felhasználók lekérése (csak bejelentkezett felhasználóknak)
app.get('/users', tokencheck, (req, res) => {
    db.query('SELECT * FROM users', (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(result);
    });
});

// Egy adott felhasználó lekérése
app.get('/users/:id', tokencheck, (req, res) => {
    const { id } = req.params;
    
    db.query('SELECT * FROM users WHERE id = ?', [id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(result[0]);
    });
});

// Felhasználó adatainak módosítása
app.put('/users/:id', tokencheck, (req, res) => {
    const { id } = req.params;
    const { name, email, password } = req.body;
    
    bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) return res.status(500).json({ error: err.message });

        db.query('UPDATE users SET name = ?, email = ?, password = ? WHERE id = ?', [name, email, hashedPassword, id], (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: 'User updated successfully' });
        });
    });
});

// Felhasználó törlése
app.delete('/users/:id', tokencheck, (req, res) => {
    const { id } = req.params;
    
    db.query('DELETE FROM users WHERE id = ?', [id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'User deleted successfully' });
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
