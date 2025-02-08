import express, { Request, Response, NextFunction, Router } from "express";
const router = Router();
import bcrypt from "bcrypt";
import { db } from "../server";
import { isAdmin } from "../utiles/adminUtils";
const jwt = require('jsonwebtoken');
import { v4 as uuidv4 } from 'uuid';
import { generateToken, tokencheck } from "../utiles/tokenUtils";
import { getRepository } from "typeorm";
import { Users } from "../entities/User";

const SECRET_KEY = process.env.JWT_SECRET;  

// Bejelentkezés (Token generálás)
router.post('/login', (req, res) => {
    const { email, password } = req.body;
    
    db.query('SELECT * FROM users WHERE email = ?', [email], (err, result) => {
        if (err) return res.status(500).json({ error: 'Hiba történt a bejelentkezés során.' });
        if (result.length === 0) return res.status(401).json({ error: 'Érvénytelen belépési adatok' });

        const user = result[0];
        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) return res.status(500).json({ error: 'Hiba történt a jelszó ellenőrzésekor.' });
            if (!isMatch) return res.status(401).json({ error: 'Érvénytelen belépési adatok' });

            const token = generateToken(user);
            res.status(200).json({
                message: "Sikeres bejelentkezés!",
                token: generateToken(user)
              });;
        });
    });
});

// Új felhasználó regisztrációja
router.post('/registration', (req, res) => {
  const { name, email, password, confirm } = req.body;

  // Jelszó ellenőrzése: legalább 8 karakter, tartalmaz kis- és nagybetűt, valamint számot
  const passwordRegExp = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/;
  if (!passwordRegExp.test(password)) {
      return res.status(400).json({ 
          error: 'A jelszónak legalább 8 karakter hosszúnak kell lennie, tartalmaznia kell kis- és nagybetűket, valamint legalább egy számot.' 
      });
  }
  if (!name || !email || !password || !confirm) {
      return res.status(400).json({ message: 'Hiányzó adatok!' });
  }
  if (password !== confirm) {
      return res.status(400).json({ message: 'A megadott jelszavak nem egyeznek!' });
  }

  db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
      if (err) {
          return res.status(500).json({ error: 'Hiba történt az e-mail cím ellenőrzésekor.' });
      }
      if (results.length > 0) {
          return res.status(400).json({ message: 'Ez az e-mail cím már regisztrálva van!' });
      }

      bcrypt.hash(password, 10, (err, hashedPassword) => {
          if (err) {
              return res.status(500).json({ error: 'Hiba történt a jelszó titkosítása közben.' });
          }

          const id = uuidv4();
          const role = 'user';   
          // Ne tárold a JWT titkosítást az adatbázisban
          db.query(
              'INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)',
              [id, name, email, hashedPassword, role], // JWT-t nem tárolunk az adatbázisban
              (err, result) => {
                  if (err) {
                      return res.status(500).json({ error: 'Hiba történt a felhasználó regisztrálása közben.' });
                  }
                  return res.status(200).json({ message: 'Sikeres regisztráció!' });
              }
          );
      });
  });
});

// Felhasználók lekérése
router.get('/', tokencheck, (req, res) => {
    db.query('SELECT * FROM users', (err, result) => {
        if (err) return res.status(500).json({ error: 'Hiba történt a felhasználók lekérése közben.' });
        res.json({ users: result, message: 'Felhasználók lekérdezése sikeresen megtörtént.' });
    });
});

// Egy adott felhasználó lekérése
router.get('/:id',tokencheck, (req, res) => {
    const { id } = req.params;
    
    db.query('SELECT * FROM users WHERE id = ?', [id], (err, result) => {
        if (err) return res.status(500).json({ error: 'Hiba történt a felhasználó lekérése közben.' });
        res.json({ user: result[0], message: 'Felhasználó sikeresen lekérdezve.' });
    });
});

// Felhasználó adatainak módosítása
router.put('/:id', tokencheck, async (req, res) => {
    const { id } = req.params;
    const { name, email, password, pictureId } = req.body;
    const userId = req.user.id;  // A tokenből származó felhasználó azonosítója

    // Ellenőrzés, hogy a felhasználó saját magát próbálja-e módosítani
    if (userId !== id && !isAdmin) {
        return res.status(403).json({ error: 'Nincs jogosultságod módosítani ezt a felhasználót.' });
    }

    try {
        const userRepository = getRepository(Users);
        const user = await userRepository.findOne({ where: { id } });

        // Ha nem található a felhasználó
        if (!user) {
            return res.status(404).json({ error: 'Felhasználó nem található.' });
        }

        // Frissítés a megadott mezőkkel
        if (name) user.name = name;
        if (email) user.email = email;
        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            user.password = hashedPassword;
        }
        if (pictureId) user.pictureId = pictureId;

        // Mentés az adatbázisba
        await userRepository.save(user);

        res.json({ message: 'Felhasználó sikeresen frissítve.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Hiba történt a felhasználó adatainak frissítése közben.' });
    }
});


// Felhasználó törlése
router.delete('/:id', tokencheck, (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;  // A tokenből származó felhasználó azonosítója

    // Ellenőrzés, hogy a felhasználó saját magát próbálja-e törölni
    if (userId !== id && !isAdmin) {
        return res.status(403).json({ error: 'Nincs jogosultságod törölni ezt a felhasználót.' });
    }

    db.query('DELETE FROM users WHERE id = ?', [id], (err, result) => {
        if (err) return res.status(500).json({ error: 'Hiba történt a felhasználó törlése közben.' });
        res.json({ message: 'Felhasználó sikeresen törölve.' });
    });
});

export default router;
