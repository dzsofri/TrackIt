import express, { Request, Response, NextFunction, Router } from "express";
import { AppDataSource } from "../data-source";
import { generateToken, tokencheck } from "../utiles/tokenUtils";
import dotenv from 'dotenv';
import { UserStatistics } from "../entities/UserStatistic";
const ejs = require("ejs");
const path = require("path");

dotenv.config(); 
const router = Router();

/*
// Egy adott felhasználó statisztikájának lekérése
router.get('/:id', tokencheck, async (req: any, res: any) => {
    const { id } = req.params;
    try {
        const statistics = await AppDataSource.getRepository(UserStatistics).find({ where: { user: id } });
        if (!statistics || statistics.length === 0) {
            return res.status(404).json({ error: 'Felhasználói statisztikák nem találhatók.' });
        }
        res.json({ statistics, message: 'Felhasználói statisztikák sikeresen lekérdezve.' });
    } catch (error) {
        res.status(500).json({ error: 'Hiba történt a felhasználói statisztikák lekérése közben.' });
    }
});
*/

// Összes felhasználói statisztika lekérése
router.get("/statistics", tokencheck, async (req: any, res: any) => {
    try {
        // Ellenőrizzük, hogy a felhasználó be van-e jelentkezve
        if (!req.user || !req.user.id) {
            return res.status(401).json({ error: "Nincs jogosultság a lekérdezéshez." });
        }

        const userId = req.user.id;

        // Lekérdezzük a felhasználó statisztikáit
        const statistics = await AppDataSource.getRepository(UserStatistics).findOne({
            where: { user: { id: userId } }, // A helyes where feltétel
            relations: ["user"] // Betöltjük a kapcsolódó user adatokat is
        });

        // Ha nincs statisztika az adott user_id-hoz
        if (!statistics) {
            return res.status(404).json({ error: "Nincsenek elérhető statisztikák a felhasználóhoz." });
        }

        // Kinyerjük a releváns adatokat
        const { completedTasks, missedTasks, completionRate } = statistics;

        res.json({
            completedTasks,
            missedTasks,
            completionRate,
            message: "Felhasználói statisztikák sikeresen lekérdezve."
        });

    } catch (error) {
        console.error("Hiba történt a statisztikák lekérése közben:", error);
        res.status(500).json({ error: "Hiba történt a statisztikák lekérése közben." });
    }
});





export default router;