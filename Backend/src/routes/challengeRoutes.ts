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

router.post("/challenge/:id", async (req: any, res: any) => {
    try {
        console.log("Kérés érkezett:", req.params, req.body);

        const {
            userId,
            challengeName,
            challengeDescription,
            status,
            completedAt,
            createdAt,
            finalDate,
            rewardPoints,
            badgeId,
            durationDays
        } = req.body;

        if (!userId || !challengeName || !challengeDescription || rewardPoints === undefined || !durationDays) {
            return res.status(400).json({ message: "Hiányzó adatok!" });
        }

        const badgeRepo = AppDataSource.getRepository(Badges);
        const badge = await badgeRepo.findOne({ where: { id: badgeId } });

        if (!badge && badgeId) {
            return res.status(404).json({ message: "A megadott jelvény nem található." });
        }

        const user_challenges = new UserChallenges();
        user_challenges.id = uuidv4();
        user_challenges.secondaryId = uuidv4();
        user_challenges.userId = userId;
        user_challenges.challengeName = challengeName;
        user_challenges.challengeDescription = challengeDescription;
        user_challenges.status = status || 0;
        user_challenges.createdAt = createdAt;
        user_challenges.finalDate = finalDate || null;
        user_challenges.rewardPoints = rewardPoints;
        user_challenges.badgeId = badgeId || null;
        user_challenges.completedAt = completedAt;
        user_challenges.durationDays = durationDays;
        user_challenges.progressPercentage = 0;
        user_challenges.completedAt = null;
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

router.post("/challenge/friend/:id", async (req: any, res: any) => {
    try {
        console.log("Kérés érkezett:", req.params, req.body);

        const {
            secondaryId,
            userId,
            challengeName,
            challengeDescription,
            status,
            createdAt,
            finalDate,
            rewardPoints,
            badgeId,
            durationDays
        } = req.body;

        if (!userId || !challengeName || !challengeDescription || rewardPoints === undefined || !durationDays) {
            return res.status(400).json({ message: "Hiányzó adatok!" });
        }

        const badgeRepo = AppDataSource.getRepository(Badges);
        const badge = await badgeRepo.findOne({ where: { id: badgeId } });

        if (!badge && badgeId) {
            return res.status(404).json({ message: "A megadott jelvény nem található." });
        }

        const user_challenges = new UserChallenges();
        user_challenges.id = uuidv4();
        user_challenges.secondaryId = secondaryId;
        user_challenges.userId = userId;
        user_challenges.challengeName = challengeName;
        user_challenges.challengeDescription = challengeDescription;
        user_challenges.status = status || 0;
        user_challenges.createdAt = createdAt;
        user_challenges.finalDate = finalDate || null;
        user_challenges.rewardPoints = rewardPoints;
        user_challenges.badgeId = badgeId || null;
        user_challenges.durationDays = durationDays;
        user_challenges.progressPercentage = 0;
        user_challenges.completedAt = null;
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

router.post("/completedAt/:id", async (req: any, res: any) => {
    try {
    const challengeRepo = AppDataSource.getRepository(UserChallenges);
    const challenge = await challengeRepo.findOne({ where: { id: req.params.id } });

    if (!challenge) {
      return res.status(404).json({ message: "A kihívás nem található." });
    }

    challenge.completedAt = req.body.completedAt || null;

    await challengeRepo.save(challenge);

    res.status(200).json({
      message: "Kihívás sikeresen befejezve.",
      challenge
    });

  } catch (error) {
    console.error("Hiba a kihívás frissítésekor:", error);
    res.status(500).json({ message: "Szerverhiba." });
  }
});

router.post("/fromPublic", async (req: any, res: any) => {
    try {
        console.log("Kérés érkezett:", req.params, req.body);

        const {
            userId,
            secondaryId,
            challengeName,
            challengeDescription,
            status,
            createdAt,
            finalDate,
            rewardPoints,
            badgeId,
            durationDays
        } = req.body;

        const badgeRepo = AppDataSource.getRepository(Badges);
        const badge = await badgeRepo.findOne({ where: { id: badgeId } });

        if (!badge && badgeId) {
            return res.status(404).json({ message: "A megadott jelvény nem található." });
        }

        const user_challenges = new UserChallenges();
        user_challenges.id = uuidv4();
        user_challenges.secondaryId = secondaryId;
        user_challenges.userId = userId;
        user_challenges.challengeName = challengeName;
        user_challenges.challengeDescription = challengeDescription;
        user_challenges.status = 1;
        user_challenges.createdAt = createdAt;
        user_challenges.finalDate = finalDate;
        user_challenges.rewardPoints = rewardPoints;
        user_challenges.badgeId = badgeId;
        user_challenges.durationDays = durationDays;
        user_challenges.progressPercentage = 0;
        user_challenges.completedAt = null;
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

        if (!badges) {
            return res.status(404).json({ message: "Badges not found." });
        }

        return res.status(200).json({ badges: formattedBadges });
    } catch (error) {
        console.error("Error fetching badges:", error);
        return res.status(500).json({ message: "Server error." });
    }
});

router.get("/badge", tokencheck, async (req: any, res: any) => {
    try {
        const challengeId = req.query.id;

        if (!challengeId) {
            return res.status(400).json({ message: "Missing challenge ID!" });
        }

        const challengeRepository = AppDataSource.getRepository(UserChallenges);
        const challenge = await challengeRepository.findOne({
            where: { id: challengeId },
            relations: ["picture"],
        });

        if (!challenge) {
            return res.status(404).json({ message: "Badges not found." });
        }

        const imageUrl = challenge.picture?.filename
            ? `http://localhost:3000/uploads/${challenge.picture.filename}`
            : null;

        return res.status(200).json({
            imageUrl,
            picture: challenge.picture
                ? {
                    id: challenge.picture.id,
                    filename: challenge.picture.filename,
                    path: challenge.picture.path,
                }
                : null,
        });
    } catch (error) {
        console.error("Error fetching badge for challenge:", error);
        return res.status(500).json({ message: "Error fetching badge for challenge." });
    }
});

router.get("/all", async (req: any, res: any) => {
  try {
    const challengeRepository = AppDataSource.getRepository(UserChallenges);
    const challenges = await challengeRepository.find({
      relations: ["user"],
    });

    if (!challenges || challenges.length === 0) {
      return res.status(404).json({ message: "Challenge not found." });
    }

    return res.status(200).json({
      challenges,
    });
  } catch (error) {
    console.error("Hiba történt a kihívások lekérésekor:", error);
    return res.status(500).json({ message: "Szerverhiba a kihívások lekérésekor." });
  }
});

router.get("/:secondaryId", async (req: any, res: any) => {
  const { secondaryId } = req.params;

  try {
    const challenges = await AppDataSource.getRepository(UserChallenges).find({
      where: { secondaryId },
      relations: ["user"],
    });

    if (!challenges || challenges.length === 0) {
      return res.status(404).json({ message: "Challenge not found." });
    }

    const userNames = new Set<string>();
    challenges.forEach(challenge => {
      if (challenge.user && challenge.user.name) {
        userNames.add(challenge.user.name);
      }
    });

    return res.json({
      secondaryId,
      users: Array.from(userNames),
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

router.delete("/:id", async (req: any, res: any) => {
    try {
        const challengeId = req.params.id;

        if (!challengeId) {
            return res.status(400).json({ message: "Hiányzó challenge ID!" });
        }

        const challengeRepository = AppDataSource.getRepository(UserChallenges);
        const challenge = await challengeRepository.findOne({ where: { id: challengeId } });

        if (!challenge) {
            return res.status(404).json({ message: "Feladat nem található!" });
        }

        await challengeRepository.remove(challenge);

        return res.status(200).json({ message: "Feladat sikeresen törölve!" });
    } catch (error) {
        console.error("Hiba történt a kihívás törlése során:", error.message, error.stack);
        return res.status(500).json({ message: "Hiba történt a kihívás törlése során.", details: error.message });
    }
});

export default router;