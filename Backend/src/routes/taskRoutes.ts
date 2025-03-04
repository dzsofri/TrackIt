import { Router, Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Tasks } from "../entities/Task";
import { Users } from "../entities/User";
import { tokencheck } from "../utiles/tokenUtils";
import { v4 as uuidv4 } from "uuid";
import cors from "cors";


const router = Router();


// Új feladat létrehozása (Token ellenőrzéssel)
router.post("/", async (req: any, res: any) => {
    try {
        const { title, description, priority, dueDate } = req.body;

        // Hiányzó adatok ellenőrzése
        if (!title || !priority || !dueDate) {
            return res.status(400).json({ message: "Hiányzó adatok!", invalidFields: { title, priority, dueDate } });
        }

        // Új feladat mentése
        const task = new Tasks();
        task.id = uuidv4();
        task.title = title;
        task.description = description || null;
        task.priority = priority;
        task.dueDate = new Date(dueDate);
        task.createdAt = new Date();

        await AppDataSource.getRepository(Tasks).save(task);

        return res.status(201).json({ message: "Feladat sikeresen létrehozva!", task });

    } catch (error) {
        console.error("Hiba történt a feladat létrehozásakor:", error);
        return res.status(500).json({ message: "Szerverhiba történt." });
    }
});

router.get("/tasks", async (req: any, res: any) => {
    try {
        const tasks = await AppDataSource.getRepository(Tasks).find();

        if (tasks.length === 0) {
            return res.status(404).json({ message: "Nincsenek feladatok az adatbázisban!" });
        }

        return res.status(200).json({ tasks });

    } catch (error) {
        console.error("Hiba történt a feladatok lekérdezésekor:", error);
        return res.status(500).json({ message: "Szerverhiba történt." });
    }
});

export default router;
