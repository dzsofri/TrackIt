import express, { Request, Response, NextFunction, Router } from "express";
import bcrypt from "bcrypt";
import { AppDataSource } from "../data-source";
import { Users } from "../entities/User";
import { generateToken, tokencheck } from "../utiles/tokenUtils";
import { validatePassword } from "../utiles/passwordUtils";
import nodemailer from "nodemailer";
import crypto from "crypto";
import dotenv from 'dotenv'; // dotenv importálása
import { isAdmin } from "../utiles/adminUtils";
import { Not } from "typeorm";
const ejs = require("ejs");
const path = require("path");

dotenv.config(); 

const router = Router();

// Hibás mezők tárolása
const addInvalidField = (fields: string[], fieldName: string) => {
    if (!fields.includes(fieldName)) {
        fields.push(fieldName);
    }
};


// SMTP beállítások
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },

    
  });

// Regisztráció
router.post("/register", async (req: any, res: any) => {
    const invalidFields: string[] = [];
    const { name, email, password } = req.body;

    if (!name) addInvalidField(invalidFields, 'name');
    if (!email) addInvalidField(invalidFields, 'email');
    if (!password) addInvalidField(invalidFields, 'password');

    if (invalidFields.length) {
        return res.status(400).json({ message: "Hiányzó adatok!", invalid: invalidFields });
    }

    if (!validatePassword(password)) {
        addInvalidField(invalidFields, 'password');
        return res.status(400).json({ 
            message: "A jelszó nem felel meg az erősségi követelményeknek!",
            invalid: invalidFields
        });
    }

    const existingUser = await AppDataSource.getRepository(Users).findOne({ where: { email } });
    if (existingUser) {
        return res.status(400).json({ message: "Ez az e-mail már létezik!", invalid: ['email'] });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new Users();
    user.name = name;
    user.email = email;
    user.password = hashedPassword;

    await AppDataSource.getRepository(Users).save(user);

    res.status(201).json({
        message: "Sikeres regisztráció!",
        user: { name: user.name, email: user.email },
        token: generateToken(user)
    });
});

// Bejelentkezés
router.post("/login", async (req: any, res: any) => {
    const invalidFields: string[] = [];
    const { email, password } = req.body;

    if (!email) addInvalidField(invalidFields, 'email');
    if (!password) addInvalidField(invalidFields, 'password');

    if (invalidFields.length) {
        return res.status(400).json({ message: "Hiányzó adatok!", invalid: invalidFields });
    }

    const user = await AppDataSource.getRepository(Users).findOne({ where: { email } });
    if (!user) {
        addInvalidField(invalidFields, 'email');
        return res.status(400).json({ message: "Felhasználó nem található!", invalid: invalidFields });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        return res.status(400).json({ message: "Hibás jelszó!" });
    }

    res.status(200).json({
        message: "Sikeres bejelentkezés!",
        token: generateToken(user),
        user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role
        }
    });
});

// Felhasználók lekérése
router.get('/', tokencheck, async (req: any, res: any) => {
    try {
        const users = await AppDataSource.getRepository(Users).find();
        res.json({ users, message: 'Felhasználók lekérdezése sikeresen megtörtént.' });
    } catch (error) {
        res.status(500).json({ error: 'Hiba történt a felhasználók lekérése közben.' });
    }
});

// Egy adott felhasználó lekérése
router.get('/users/:id', tokencheck, async (req: any, res: any) => {
    const { id } = req.params;
    try {
        const user = await AppDataSource.getRepository(Users).findOne({ where: { id } });
        if (!user) {
            return res.status(404).json({ error: 'Felhasználó nem található.' });
        }
        res.json({ user, message: 'Felhasználó sikeresen lekérdezve.' });
    } catch (error) {
        res.status(500).json({ error: 'Hiba történt a felhasználó lekérése közben.' });
    }
});

// Felhasználó adatainak módosítása
router.put('/:id', tokencheck, isAdmin, async (req: any, res: any) => {
    const { id } = req.params;
    const { role } = req.body; 
    const invalidFields: string[] = [];

    try {
        const userRepository = AppDataSource.getRepository(Users);
        const user = await userRepository.findOne({ where: { id } });
        
        if (!user) {
            return res.status(404).json({ error: 'Felhasználó nem található.', invalid: ['user'] });
        }

        if (role) user.role = role;

        const updatedUser = await userRepository.save(user); 
        console.log("Frissített felhasználó:", updatedUser);  

        res.json({ message: 'Felhasználó sikeresen frissítve.', updatedUser });
    } catch (error) {
        console.error("Hiba a felhasználó frissítésekor:", error); 
        res.status(500).json({ error: 'Hiba történt a felhasználó adatainak frissítése közben.' });
    }
});



// Felhasználó törlése
router.delete('/:id', tokencheck, async (req: any, res: any) => {
    const { id } = req.params;
    const userId = req.user.id;
    const invalidFields: string[] = [];

    const isUserAdmin = req.user.role === "ADMIN";
    if (userId !== id && !isUserAdmin) {
        return res.status(403).json({ error: 'Nincs jogosultságod törölni ezt a felhasználót.', invalid: ['user'] });
    }

    try {
        const userRepository = AppDataSource.getRepository(Users);
        const user = await userRepository.findOne({ where: { id } });
        if (!user) {
            return res.status(404).json({ error: 'Felhasználó nem található.', invalid: ['user'] });
        }

        await userRepository.delete(id);
        res.json({ message: 'Felhasználó sikeresen törölve.' });
    } catch (error) {
        res.status(500).json({ error: 'Hiba történt a felhasználó törlése közben.', invalid: invalidFields });
    }
});

// Jelszó elfelejtése - Token generálás és e-mail küldés
router.post("/forgot-password", async (req: any, res: any) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: "E-mail megadása kötelező!" });
    }

    const user = await AppDataSource.getRepository(Users).findOne({ where: { email } });
    if (!user) {
        return res.status(400).json({ message: "Ezzel az e-mail címmel nem található felhasználó!" });
    }

    // Token generálása
    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = await bcrypt.hash(resetToken, 10);
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 óra lejárati idő

    await AppDataSource.getRepository(Users).save(user);

    // E-mail küldése
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}&email=${email}`;
const mailOptions = {
    from: `"TrackIt" <${process.env.SMTP_USER}>`,
    to: user.email,
    subject: "Jelszó visszaállítási kérelem",
    html: await ejs.renderFile(path.join(__dirname, '../../views/reset-password.ejs'), { user, resetUrl }),
};

    try {
        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: "Jelszó visszaállítási e-mail elküldve!" });
    } catch (error) {
        console.error("E-mail küldési hiba:", error);
        res.status(500).json({ message: "Hiba történt az e-mail küldésekor." });
    }
});

// Jelszó visszaállítása
router.post("/reset-password", async (req: any, res: any) => {
    const { email, token, newPassword } = req.body;

    const invalidFields: string[] = []; // Hibás mezők tömbje

    // Ellenőrizzük, hogy az új jelszó meg van-e adva
    if (!newPassword || newPassword.trim() === '') {
        invalidFields.push('newPassword'); // Hozzáadjuk a hibás mezőt
    }

    if (invalidFields.length > 0) {
        return res.status(400).json({ 
            message: "A jelszó nem felel meg a követelményeknek!", 
            invalid: invalidFields 
        });
    }

    const user = await AppDataSource.getRepository(Users).findOne({ where: { email } });
    if (!user || !user.resetPasswordToken || !user.resetPasswordExpires) {
        return res.status(400).json({ message: "Érvénytelen vagy lejárt token!" });
    }

    // Token ellenőrzése
    const isTokenValid = await bcrypt.compare(token, user.resetPasswordToken);
    if (!isTokenValid || user.resetPasswordExpires < new Date()) {
        return res.status(400).json({ message: "Érvénytelen vagy lejárt token!" });
    }

    // Jelszó frissítése
    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;

    await AppDataSource.getRepository(Users).save(user);

    res.status(200).json({ message: "Jelszó sikeresen frissítve!" });
});

router.patch('/:id', tokencheck, async (req: any, res: any) => {
    const userId = req.params.id;
    const invalidFields: string[] = [];
    const { name, email, password, confirm } = req.body;

    if (!name) addInvalidField(invalidFields, 'name');
    if (!email) addInvalidField(invalidFields, 'email');
    if (!password) addInvalidField(invalidFields, 'password');

    if (invalidFields.length) {
        return res.status(400).json({ message: "Hiányzó adatok!", invalid: invalidFields });
    }

    if (!validatePassword(password)) {
        addInvalidField(invalidFields, 'password');
        return res.status(400).json({ 
            message: "A jelszó nem felel meg az erősségi követelményeknek!",
            invalid: invalidFields
        });
    }

    const existingUser = await AppDataSource.getRepository(Users).findOne({ where: { id: userId } });
    if (!existingUser) {
        return res.status(404).json({ message: "Felhasználó nem található!" });
    }

    const emailConflict = await AppDataSource.getRepository(Users).findOne({ where: { email, id: Not(userId) } });
    if (emailConflict) {
        return res.status(400).json({ message: "Ez az e-mail már létezik!", invalid: ['email'] });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    existingUser.name = name;
    existingUser.email = email;
    existingUser.password = hashedPassword;

    await AppDataSource.getRepository(Users).save(existingUser);

    res.status(200).json({
        message: "Felhasználó sikeresen frissítve!",
        user: { name: existingUser.name, email: existingUser.email },
    });
});


// Frissíti a felhasználó státuszát (online/offline)
router.patch("/status", tokencheck, async (req: any, res: any) => {
    const { status } = req.body;

    // Ellenőrzés, hogy a státusz online vagy offline
    if (!status || (status !== "online" && status !== "offline")) {
       
        return res.status(400).json({ message: "Érvénytelen státusz! Csak 'online' vagy 'offline' értékek megengedettek." });
    }

    try {
        const userRepository = AppDataSource.getRepository(Users);
        const user = await userRepository.findOne({ where: { id: req.user.id } });

        if (!user) {
            return res.status(404).json({ message: "Felhasználó nem található." });
        }

        // Státusz frissítése
        user.status = status;
        await userRepository.save(user);

        res.status(200).json({
            message: "Státusz sikeresen frissítve.",
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                status: user.status
            }
        });
    } catch (error) {
        console.error("Hiba a státusz frissítésekor:", error);
        res.status(500).json({ message: "Hiba történt a státusz frissítése közben." });
    }
});

export default router;