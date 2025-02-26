import express, { Request, Response, NextFunction, Router } from "express";
import bcrypt from "bcrypt";
import { AppDataSource } from "../data-source";
import { Users } from "../entities/User";
import { generateToken, tokencheck } from "../utiles/tokenUtils";
import { validatePassword } from "../utiles/passwordUtils";
import nodemailer from "nodemailer";
import crypto from "crypto";
import dotenv from 'dotenv'; // dotenv importálása
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
router.get('/:id', tokencheck, async (req: any, res: any) => {
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
router.put('/:id', tokencheck, async (req: any, res: any) => {
    const { id } = req.params;
    const { name, email, password, pictureId } = req.body;
    const userId = req.user.id;
    const invalidFields: string[] = [];

    const isUserAdmin = req.user.role === "ADMIN";
    if (userId !== id && !isUserAdmin) {
        return res.status(403).json({ error: 'Nincs jogosultságod módosítani ezt a felhasználót.', invalid: ['user'] });
    }

    try {
        const userRepository = AppDataSource.getRepository(Users);
        const user = await userRepository.findOne({ where: { id } });
        if (!user) {
            return res.status(404).json({ error: 'Felhasználó nem található.', invalid: ['user'] });
        }

        if (name) user.name = name;
        if (email) user.email = email;
        if (password) {
            if (!validatePassword(password)) {
                addInvalidField(invalidFields, 'password');
                return res.status(400).json({ message: "A jelszó nem felel meg az erősségi követelményeknek!", invalid: invalidFields });
            }
            user.password = await bcrypt.hash(password, 10);
        }
        if (pictureId) user.pictureId = pictureId;

        await userRepository.save(user);
        res.json({ message: 'Felhasználó sikeresen frissítve.' });
    } catch (error) {
        res.status(500).json({ error: 'Hiba történt a felhasználó adatainak frissítése közben.', invalid: invalidFields });
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

    if (!email || !token || !newPassword) {
        return res.status(400).json({ message: "Hiányzó adatok!" });
    }

    const user = await AppDataSource.getRepository(Users).findOne({ where: { email } });
    if (!user || !user.resetPasswordToken || !user.resetPasswordExpires) {
        return res.status(400).json({ message: "Érvénytelen vagy lejárt token!" });
    }

    // Debug üzenetek
    console.log("Ellenőrzés előtt: ", { email, token, newPassword });
    console.log("Felhasználó: ", user);
    console.log("Hashelt token: ", user.resetPasswordToken);
    console.log("Token: ", token);
    console.log("Lejárati idő: ", user.resetPasswordExpires);
    console.log("Aktuális idő: ", new Date());

    // Token ellenőrzése
    const isTokenValid = await bcrypt.compare(token, user.resetPasswordToken);
    if (!isTokenValid || user.resetPasswordExpires < new Date()) {
        return res.status(400).json({ message: "Érvénytelen vagy lejárt token!" });
    }

    if (!validatePassword(newPassword)) {
        return res.status(400).json({ message: "A jelszó nem felel meg az erősségi követelményeknek!" });
    }

    // Jelszó frissítése
    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;

    await AppDataSource.getRepository(Users).save(user);

    res.status(200).json({ message: "Jelszó sikeresen frissítve!" });
});




export default router;
