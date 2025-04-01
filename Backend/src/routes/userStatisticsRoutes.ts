import express, { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { tokencheck } from "../utiles/tokenUtils";
import dotenv from 'dotenv';
import { UserStatistics } from "../entities/UserStatistic";
import { Habits } from "../entities/Habit";
import { UserChallenges } from "../entities/UserChallenge";
import { Users } from "../entities/User";
import { Tasks } from "../entities/Task";

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
      return res.status(204).json({ message: "No statistics available for the user." });
    }

    res.json(statistics);
  } catch (error) {
    console.error("Error fetching statistics:", error);
    res.status(500).json({ error: "Error fetching statistics." });
  }
});

router.post("/completedTask", tokencheck, async (req: any, res: any) => {
  try {
    const { taskId } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: User ID not found." });
    }

    const tasksRepo = AppDataSource.getRepository(Tasks);
    const task = await tasksRepo.findOne({ where: { id: taskId } });

    if (!task) {
      return res.status(404).json({ message: "Task not found." });
    }

    const usersRepo = AppDataSource.getRepository(Users);
    const user = await usersRepo.findOne({ where: { id: userId } });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const userStatisticsRepo = AppDataSource.getRepository(UserStatistics);
    
    const userStatistics = new UserStatistics();
    userStatistics.user = user;
    userStatistics.completedTasks = 1;
    userStatistics.missedTasks = 0;
    userStatistics.completionRate = 0;
    userStatistics.activeTask = task;
    userStatistics.createdAt = new Date();

    await userStatisticsRepo.save(userStatistics);

    return res.status(200).json({ message: "UserStatistics updated successfully", userStatistics });
  } catch (error) {
    console.error("Error updating UserStatistics:", error);
    return res.status(500).json({ message: "Server error." });
  }
});

router.post("/missedTask", tokencheck, async (req: any, res: any) => {
  try {
    const { taskId } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: User ID not found." });
    }

    const tasksRepo = AppDataSource.getRepository(Tasks);
    const task = await tasksRepo.findOne({ where: { id: taskId } });

    const usersRepo = AppDataSource.getRepository(Users);
    const user = await usersRepo.findOne({ where: { id: userId } });

    const userStatisticsRepo = AppDataSource.getRepository(UserStatistics);
    
    const userStatistics = new UserStatistics();
    userStatistics.user = user;
    userStatistics.completedTasks = 0;
    userStatistics.missedTasks = 1;
    userStatistics.completionRate = 0;
    userStatistics.activeTask = task;
    userStatistics.createdAt = new Date();

    await userStatisticsRepo.save(userStatistics);

    return res.status(200).json({ message: "UserStatistics updated successfully", userStatistics });
  } catch (error) {
    console.error("Error updating UserStatistics:", error);
    return res.status(500).json({ message: "Server error." });
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
      return res.status(204).json({ message: "No habits available for the user." });
    }

    res.json(habits);
  } catch (error) {
    console.error("Error fetching habits:", error);
    res.status(500).json({ error: "Error fetching habits." });
  }
});

router.get("/challenges/:userId", tokencheck, async (req: any, res: any) => {
  try {
    const { userId } = req.params;
    if (!req.user || req.user.id !== userId) {
      return res.status(401).json({ error: "Unauthorized access." });
    }

    const challenges = await AppDataSource.getRepository(UserChallenges).find({
      where: { user: { id: userId } },
      relations: ["user"]
    });

    if (!challenges || challenges.length === 0) {
      return res.status(204).json({ message: "No challenges available for the user." });
    }

    res.json(challenges);
  } catch (error) {
    console.error("Error fetching habits:", error);
    res.status(500).json({ error: "Error fetching challenges." });
  }
});

export default router;