import { Router, Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Tasks } from "../entities/Task";
import { Users } from "../entities/User";
import { tokencheck } from "../utiles/tokenUtils";
import { v4 as uuidv4 } from "uuid";
import cors from "cors";

const router = Router();


// Új feladat létrehozása (Token ellenőrzéssel)
router.post("/", tokencheck, async (req: any, res: any) => {
    try {
        const { title, description, priority, dueDate } = req.body;

        if (!title || !priority || !dueDate) {
            return res.status(400).json({ message: "Hiányzó adatok!" });
        }

        const task = new Tasks();
        task.id = uuidv4();
        task.title = title;
        task.description = description || null;
        task.priority = priority;
        task.dueDate = new Date(dueDate);
        task.createdAt = new Date();
        task.userId = req.user.id; // 🔹 Beállítjuk a felhasználó ID-ját

        await AppDataSource.getRepository(Tasks).save(task);

        return res.status(201).json({ message: "Feladat létrehozva!", task });

    } catch (error) {
        console.error("Hiba történt:", error);
        return res.status(500).json({ message: "Szerverhiba." });
    }
});

router.get("/", async (req: any, res: any) => {
    try {
        const tasks = await AppDataSource.getRepository(Tasks).find();

        if (!tasks.length) {
            return res.status(200).json({ message: "Nincsenek feladatok az adatbázisban!", tasks: [] }); // 🔹 Üzenet + üres lista
        }

        return res.status(200).json({ tasks });

    } catch (error) {
        console.error("Hiba történt a feladatok lekérdezésekor:", error);
        return res.status(500).json({ message: "Szerverhiba történt." });
    }
});

// Task frissítéséhez szükséges kérés típusának meghatározása  


router.put("/:id", async (req: any, res: any) => {
    try {
        const { id } = req.params;
        const { title, description, dueDate , status} = req.body;


        const taskRepository = AppDataSource.getRepository(Tasks);
        let task = await taskRepository.findOneBy({ id });

        if (!task) {
            return res.status(404).json({ message: "Feladat nem található!" });
        }

        // Csak a megengedett mezők frissítése
        task.title = title;
        task.description = description;
        task.dueDate = dueDate;
        task.status = status;

        await taskRepository.save(task);

        return res.status(200).json({ message: "Feladat frissítve!", task });

    } catch (error) {
        console.error("Hiba történt a feladat frissítésekor:", error);
        return res.status(500).json({ message: "Szerverhiba történt." });
    }
});


// Task törléséhez szükséges végpont
router.delete("/:id", async (req: any, res: any) => {
    try {
        const { id } = req.params;
        
        // Ellenőrizzük, hogy létezik-e a feladat az adatbázisban
        const taskRepository = AppDataSource.getRepository(Tasks);
        const task = await taskRepository.findOneBy({ id });

        if (!task) {
            return res.status(404).json({ message: "Feladat nem található!" });
        }

        // Feladat törlése az adatbázisból
        await taskRepository.remove(task);

        return res.status(200).json({ message: "Feladat sikeresen törölve!" });

    } catch (error) {
        console.error("Hiba történt a feladat törlésénél:", error);
        return res.status(500).json({ message: "Szerverhiba történt." });
    }
});

// Státusz frissítése PATCH kéréssel
router.patch("/:id/status", async (req: any, res: any) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({ message: "A státusz nem lehet üres!" });
        }

        const taskRepository = AppDataSource.getRepository(Tasks);
        let task = await taskRepository.findOneBy({ id });

        if (!task) {
            return res.status(404).json({ message: "Feladat nem található!" });
        }

        // Csak a státusz frissítése
        task.status = status;

        await taskRepository.save(task);

        return res.status(200).json({ message: "Feladat státusza frissítve!", task });

    } catch (error) {
        console.error("Hiba történt a feladat státuszának frissítésekor:", error);
        return res.status(500).json({ message: "Szerverhiba történt." });
    }
});



export default router;