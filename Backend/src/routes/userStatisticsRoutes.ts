import express, { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { tokencheck } from "../utiles/tokenUtils";
import dotenv from 'dotenv';
import { UserStatistics } from "../entities/UserStatistic";
import { Habits } from "../entities/Habit";

dotenv.config();
const router = express.Router();

router.get("/statistics/:userId", tokencheck, async (req: any, res: any) => {
  try {
    const { userId } = req.params;
    if (!req.user || req.user.id !== userId) {
      return res.status(401).json({ error: "Unauthorized access." });
    }

    const statistics = await AppDataSource.getRepository(UserStatistics).find({
      where: { user: { id: userId } },
      relations: ["user"]
    });

    if (!statistics || statistics.length === 0) {
      return res.status(404).json({ error: "No statistics available for the user." });
    }

    res.json(statistics);
  } catch (error) {
    console.error("Error fetching statistics:", error);
    res.status(500).json({ error: "Error fetching statistics." });
  }
});

router.get("/habit/:userId", tokencheck, async (req: any, res: any) => {
  try {
    const { userId } = req.params;
    if (!req.user || req.user.id !== userId) {
      return res.status(401).json({ error: "Unauthorized access." });
    }

    const habits = await AppDataSource.getRepository(Habits).find({
      where: { user: { id: userId } },
      relations: ["user"]
    });

    if (!habits || habits.length === 0) {
      return res.status(404).json({ error: "No habits available for the user." });
    }

    res.json(habits);
  } catch (error) {
    console.error("Error fetching habits:", error);
    res.status(500).json({ error: "Error fetching habits." });
  }
});

export default router;