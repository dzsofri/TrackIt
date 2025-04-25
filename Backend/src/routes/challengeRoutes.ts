import express, { Request, Response, NextFunction, Router } from "express";
import { AppDataSource } from "../data-source";
import { UserChallenges } from "../entities/UserChallenge";
import { generateToken, tokencheck } from "../utiles/tokenUtils";
import fs from 'fs';
const path = require("path");
import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import { Badges } from "../entities/Badges";

const router = Router();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, "..", "uploads");
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        cb(null, `${uniqueSuffix}-${file.originalname}`);
    },
});

const upload = multer({ storage });
  
export const uploadsMiddleware = express.static(
    path.join(__dirname, "..", "uploads")
);

const addInvalidField = (fields: string[], fieldName: string) => {
    if (!fields.includes(fieldName)) {
        fields.push(fieldName);
    }
};

router.post("/challenge/:id", async (req: any, res: any) => {
    try {
        console.log("Kérés érkezett:", req.params, req.body);

        const userId = req.params.id;
        const {
            challengeName,
            challengeDescription,
            status,
            createdAt,
            finalDate,
            rewardPoints,
            badgeId,
            durationDays
        } = req.body;

        // Validáció
        if (!userId || !challengeName || !challengeDescription || rewardPoints === undefined || !durationDays) {
            return res.status(400).json({ message: "Hiányzó adatok!" });
        }

        const badgeRepo = AppDataSource.getRepository(Badges);
        const badge = await badgeRepo.findOne({ where: { id: badgeId } });

        if (!badge && badgeId) {
            return res.status(404).json({ message: "A megadott jelvény nem található." });
        }

        const user_challenges = new UserChallenges();
        user_challenges.id = uuidv4(); // UUID generálása
        user_challenges.userId = userId;
        user_challenges.challengeName = challengeName;
        user_challenges.challengeDescription = challengeDescription;
        user_challenges.status = status || 0; // Alapértelmezett 0
        user_challenges.createdAt = createdAt;
        user_challenges.finalDate = finalDate || null; // Null, ha nincs megadva
        user_challenges.rewardPoints = rewardPoints;
        user_challenges.badgeId = badgeId || null; // Null, ha nincs megadva
        user_challenges.durationDays = durationDays;
        user_challenges.progressPercentage = 0; // Kezdeti érték 0
        user_challenges.completedAt = null; // Null, ha nincs megadva

        await AppDataSource.getRepository(UserChallenges).save(user_challenges);

        console.log("Sikeres mentés:", user_challenges);

        res.status(201).json({
            message: "Sikeres kihívás létrehozása!",
            user_challenges,
        });
    } catch (error) {
        console.error("Hiba történt a kihívás létrehozása során:", error);
        res.status(500).json({ message: "Hiba történt a kihívás létrehozása során." });
    }
});

router.get("/all-badges", async (req: any, res: any) => {
    try {
        const badgeRepository = AppDataSource.getRepository(Badges);
        const badges = await badgeRepository.find();

        const formattedBadges = badges.map((badge) => ({
            id: badge.id,
            filename: badge.filename,
            imageUrl: `http://localhost:3000/uploads/${badge.filename}`,
        }));

        return res.status(200).json({ badges: formattedBadges });
    } catch (error) {
        console.error("Error fetching badges:", error);
        return res.status(500).json({ message: "Server error." });
    }
});

export default router;