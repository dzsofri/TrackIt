import { Router, Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Tasks } from "../entities/Task";
import { Users } from "../entities/User";
import { tokencheck } from "../utiles/tokenUtils";
import { v4 as uuidv4 } from "uuid";

const router = Router();


// Új feladat létrehozása (Token ellenőrzéssel)
router.post("/", tokencheck, async (req: any, res: any) => {
    try {
        const { title, description, priority, dueDate } = req.body;
        const userId = req.user?.id; // A tokenből kivett user ID

        if (!userId) {
            return res.status(401).json({ message: "Nincs jogosultság!" });
        }

        // Hiányzó adatok ellenőrzése
        if (!title || !priority || !dueDate) {
            return res.status(400).json({ message: "Hiányzó adatok!", invalidFields: { title, priority, dueDate } });
        }

        // Felhasználó ellenőrzése
        const user = await AppDataSource.getRepository(Users).findOne({ where: { id: userId } });

        if (!user) {
            return res.status(404).json({ message: "Felhasználó nem található." });
        }

        // Új feladat mentése
        const task = new Tasks();
        task.id = uuidv4();
        task.title = title;
        task.description = description || null;
        task.priority = priority;
        task.dueDate = new Date(dueDate);
        task.user = user;
        task.userId = userId;
        task.createdAt = new Date();

        await AppDataSource.getRepository(Tasks).save(task);

        return res.status(201).json({ message: "Feladat sikeresen létrehozva!", task });

    } catch (error) {
        console.error("Hiba történt a feladat létrehozásakor:", error);
        return res.status(500).json({ message: "Szerverhiba történt." });
    }
});


export default router;
