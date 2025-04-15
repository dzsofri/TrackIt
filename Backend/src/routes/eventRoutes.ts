import { Router } from "express";
import { AppDataSource } from "../data-source";
import { Events } from "../entities/Event";
import { Users } from "../entities/User";
import { tokencheck } from "../utiles/tokenUtils";

const router = Router();
const eventRepo = AppDataSource.getRepository(Events);

// Új esemény létrehozása
router.post("/", tokencheck, async (req: any, res: any) => {
    try {
        const { title, description, startTime, endTime, color } = req.body;
        const { userId } = req;  // Kinyerjük a userId-t a tokenből

        // Ellenőrizzük, hogy létezik-e a felhasználó a token alapján
        const user = await AppDataSource.getRepository(Users).findOneBy({ id: userId });
        if (!user) {
            return res.status(404).json({ message: "Felhasználó nem található." });
        }

        // Az esemény létrehozása
        const event = eventRepo.create({
            title,
            description,
            startTime: new Date(startTime),
            endTime: new Date(endTime),
            color,
        });

        // Esemény mentése az adatbázisba
        await eventRepo.save(event);
        res.status(201).json({ message: "Esemény létrehozva.", event });
    } catch (err) {
        res.status(500).json({ message: "Hiba az esemény létrehozásakor.", error: err });
    }
});


// Összes esemény lekérdezése
router.get("/", tokencheck, async (req, res) => {
    try {
        const events = await eventRepo.find({ relations: ["user"] });
        res.json(events);
    } catch (err) {
        res.status(500).json({ message: "Hiba az események lekérdezésekor." });
    }
});

// Egy adott esemény lekérdezése
router.get("/:id", tokencheck, async (req:any, res:any) => {
    try {
        const event = await eventRepo.findOne({
            where: { id: req.params.id },
            relations: ["user"]
        });

        if (!event) return res.status(404).json({ message: "Esemény nem található." });

        res.json(event);
    } catch (err) {
        res.status(500).json({ message: "Hiba az esemény lekérdezésekor." });
    }
});

// Esemény frissítése
router.put("/:id", tokencheck, async (req:any, res:any) => {
    try {
        const event = await eventRepo.findOneBy({ id: req.params.id });
        if (!event) return res.status(404).json({ message: "Esemény nem található." });

        const { title, description, startTime, endTime } = req.body;

        event.title = title ?? event.title;
        event.description = description ?? event.description;
        event.startTime = startTime ? new Date(startTime) : event.startTime;
        event.endTime = endTime ? new Date(endTime) : event.endTime;

        await eventRepo.save(event);
        res.json(event);
    } catch (err) {
        res.status(500).json({ message: "Hiba az esemény frissítésekor." });
    }
});

// Esemény törlése
router.delete("/:id", tokencheck, async (req:any, res:any) => {
    try {
        const event = await eventRepo.findOneBy({ id: req.params.id });
        if (!event) return res.status(404).json({ message: "Esemény nem található." });

        await eventRepo.remove(event);
        res.json({ message: "Esemény törölve." });
    } catch (err) {
        res.status(500).json({ message: "Hiba az esemény törlésekor." });
    }
});

export default router;
