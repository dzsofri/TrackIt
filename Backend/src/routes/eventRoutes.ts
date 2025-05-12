import { Router } from "express";
import { AppDataSource } from "../data-source";
import { Events } from "../entities/Event";
import { Users } from "../entities/User";
import { tokencheck } from "../utiles/tokenUtils";

const router = Router();
const eventRepo = AppDataSource.getRepository(Events);

// Új esemény létrehozása (Token ellenőrzéssel)
router.post("/", tokencheck, async (req: any, res: any) => {
    try {
        const { title, description, startTime, endTime, color } = req.body;

        if (!title || !startTime || !endTime || !color) {
            return res.status(400).json({ message: "Hiányzó mezők: title, startTime, endTime, color" });
        }

        const start = new Date(startTime);
        const end = new Date(endTime);

        if (isNaN(start.getTime()) || isNaN(end.getTime()) || start >= end) {
            return res.status(400).json({ message: "Érvénytelen időpontok" });
        }

        if (!req.user?.id) {
            return res.status(401).json({ message: "Nincs hitelesített felhasználó" });
        }

        const user = await AppDataSource.getRepository(Users).findOneBy({ id: req.user.id });

        if (!user) {
            return res.status(400).json({ message: "Felhasználó nem található" });
        }

        const event = new Events();
        event.title = title;
        event.description = description || null;
        event.startTime = start;
        event.endTime = end;
        event.color = color;
        event.createdAt = new Date();
        event.user = user;

        await eventRepo.save(event);

        return res.status(201).json({ message: "Esemény létrehozva!"});

    } catch (error: any) {
        console.error("Hiba:", error);
        return res.status(500).json({ message: "Szerverhiba", error: error.message || error });
    }
});

// Bejelentkezett felhasználó saját eseményeinek lekérdezése
router.get("/", tokencheck, async (req: any, res: any) => {
    try {
        const events = await eventRepo.find({
            where: { user: { id: req.user.id } },
            relations: ["user"]
        });

        if (events.length === 0) {
            return res.status(404).json({ message: "Nincsenek eseményeid." });
        }

        res.json(events);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Hiba az események lekérdezésekor.", error: err.message || err });
    }
});

// Egy adott esemény lekérdezése (csak ha a sajátja)
router.get("/:id", tokencheck, async (req: any, res: any) => {
    try {
        const event = await eventRepo.findOne({
            where: { id: req.params.id },
            relations: ["user"]
        });

        if (!event) return res.status(404).json({ message: "Esemény nem található." });

        if (event.user.id !== req.user.id) {
            return res.status(403).json({ message: "Nincs jogosultságod ehhez az eseményhez." });
        }

        res.json(event);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Hiba az esemény lekérdezésekor.", error: err.message || err });
    }
});

// Események lekérdezése tetszőleges felhasználóhoz (pl. admin nézet)
router.get("/user/:userId", tokencheck, async (req: any, res: any) => {
    try {
        const { userId } = req.params;

        const user = await AppDataSource.getRepository(Users).findOneBy({ id: userId });
        if (!user) {
            return res.status(404).json({ message: "Felhasználó nem található." });
        }

        const events = await eventRepo.find({
            where: { user: { id: userId } },
            relations: ["user"]
        });

        res.json(events);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Hiba az események lekérdezésekor.", error: err.message || err });
    }
});


// Esemény frissítése (csak saját)
router.put("/:id", tokencheck, async (req: any, res: any) => {
    try {
        const event = await eventRepo.findOne({
            where: { id: req.params.id },
            relations: ["user"]
        });

        if (!event) return res.status(404).json({ message: "Esemény nem található." });

        if (event.user.id !== req.user.id) {
            return res.status(403).json({ message: "Nincs jogosultságod módosítani ezt az eseményt." });
        }

        const { title, description, startTime, endTime, color } = req.body;

        event.title = title ?? event.title;
        event.description = description ?? event.description;
        event.startTime = startTime ? new Date(startTime) : event.startTime;
        event.endTime = endTime ? new Date(endTime) : event.endTime;
        event.color = color ?? event.color;

        await eventRepo.save(event);
        res.json({ message: "Esemény frissítve.", event });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Hiba az esemény frissítésekor.", error: err.message || err });
    }
});

// Esemény törlése (csak saját)
router.delete("/:id", tokencheck, async (req: any, res: any) => {
    try {
        const event = await eventRepo.findOne({
            where: { id: req.params.id },
            relations: ["user"]
        });

        if (!event) return res.status(404).json({ message: "Esemény nem található." });

        if (event.user.id !== req.user.id) {
            return res.status(403).json({ message: "Nincs jogosultságod törölni ezt az eseményt." });
        }

        await eventRepo.remove(event);
        res.json({ message: "Esemény törölve." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Hiba az esemény törlésekor.", error: err.message || err });
    }
});

export default router;
