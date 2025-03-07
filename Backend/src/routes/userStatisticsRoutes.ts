import express, { Request, Response, NextFunction, Router } from "express";
import { AppDataSource } from "../data-source";
import { generateToken, tokencheck } from "../utiles/tokenUtils";
import dotenv from 'dotenv';
import { UserStatistics } from "../entities/UserStatistic";
const ejs = require("ejs");
const path = require("path");

dotenv.config(); 
const router = Router();

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



export default router;