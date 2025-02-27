import { Router } from "express";
import { AppDataSource } from "../data-source";
import { Tasks } from "../entities/Task";
import { Users } from "../entities/User";
import { tokencheck } from "../utiles/tokenUtils";
import { v4 as uuidv4 } from "uuid";

const router = Router();

// Új feladat létrehozása
router.post("/tasks", async (req: any, res: any) => {
    const { title, description, priority, dueDate } = req.body;
    const userId = req.user.id;

    // Hiányzó adatok ellenőrzése
    const invalidFields: string[] = [];
    if (!title) invalidFields.push("title");
    if (!priority) invalidFields.push("priority");
    if (!dueDate) invalidFields.push("dueDate");

    if (invalidFields.length) {
        return res.status(400).json({ message: "Hiányzó adatok!", invalid: invalidFields });
    }

    try {
        const user = await AppDataSource.getRepository(Users).findOne({ where: { id: userId } });
        if (!user) {
            return res.status(404).json({ message: "Felhasználó nem található." });
        }

        const task = new Tasks();
        task.id = uuidv4(); // Egyedi azonosító generálása
        task.title = title;
        task.description = description || null;
        task.priority = priority;
        task.dueDate = new Date(dueDate); // A megfelelő formátum beállítása
        task.user = user;
        task.userId = userId;
        task.createdAt = new Date(); // Létrehozás dátumának beállítása

        await AppDataSource.getRepository(Tasks).save(task);

        res.status(201).json({
            message: "Feladat sikeresen létrehozva!",
            task: {
                id: task.id,
                title: task.title,
                description: task.description,
                priority: task.priority,
                dueDate: task.dueDate,
                createdAt: task.createdAt,
            }
        });
    } catch (error) {
        console.error("Hiba történt a feladat létrehozásakor:", error);
        res.status(500).json({ message: "Hiba történt a feladat létrehozásakor." });
    }
});

export default router;
