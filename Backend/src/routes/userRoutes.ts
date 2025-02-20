import express, { Request, Response, NextFunction, Router } from "express";
import bcrypt from "bcrypt";
import { AppDataSource } from "../data-source";
import { Users } from "../entities/User";
import { generateToken, tokencheck } from "../utiles/tokenUtils";
import { validatePassword } from "../utiles/passwordUtils";

const router = Router();

// Hibás mezők tárolása
const addInvalidField = (fields: string[], fieldName: string) => {
    if (!fields.includes(fieldName)) {
        fields.push(fieldName);
    }
};

// Regisztráció
router.post("/register", async (req: any, res: any) => {
    const invalidFields: string[] = [];
    const { username, email, password } = req.body;

    if (!username) addInvalidField(invalidFields, 'username');
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
    user.name = username;
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
            username: user.name,
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

export default router;
