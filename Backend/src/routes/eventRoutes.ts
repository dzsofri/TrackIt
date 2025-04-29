import { Router } from "express";
import { AppDataSource } from "../data-source";
import { Events } from "../entities/Event";
import { Users } from "../entities/User";
import { tokencheck } from "../utiles/tokenUtils";

const router = Router();
const eventRepo = AppDataSource.getRepository(Events);

// Új esemény létrehozása (Token ellenőrzéssel)
// Új esemény létrehozása (Token ellenőrzéssel)


// Új esemény létrehozása (Token ellenőrzéssel)
router.post("/", tokencheck, async (req: any, res: any) => {
    try {
        const { title, description, startTime, endTime, color } = req.body;

        // Ellenőrizzük, hogy minden szükséges adat megvan-e
        if (!title || !startTime || !endTime || !color) {
            return res.status(400).json({ message: "Hiányzó adatok!" });
        }

        // Az új esemény létrehozása
        const event = new Events();
        event.title = title;
        event.description = description || null;
        event.startTime = new Date(startTime);
        event.endTime = new Date(endTime);
        event.color = color;
        event.createdAt = new Date();
        event.userId = req.user.id; // Beállítjuk a userId-t (nem szükséges lekérni a teljes felhasználót)

        // Az esemény mentése az adatbázisba
        await AppDataSource.getRepository(Events).save(event);

        // Válasz visszaküldése
        return res.status(201).json({ message: "Esemény létrehozva!", event });

    } catch (error) {
        console.error("Hiba történt:", error);
        return res.status(500).json({ message: "Szerverhiba.", error: error.message || error });
    }
});




// Bejelentkezett felhasználó saját eseményeinek lekérdezése
router.get("/", tokencheck, async (req: any, res: any) => {
    try {
        const { userId } = req;

        // Az események lekérdezése a felhasználó ID-ja alapján
        const events = await eventRepo.find({
            where: { userId: { id: userId } },
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
        const { userId } = req;

        // Esemény lekérdezése a megadott ID alapján
        const event = await eventRepo.findOne({
            where: { id: req.params.id },
            relations: ["user"]
        });

        if (!event) return res.status(404).json({ message: "Esemény nem található." });

        if (event.userId.id !== userId) {
            return res.status(403).json({ message: "Nincs jogosultságod ehhez az eseményhez." });
        }

        res.json(event);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Hiba az esemény lekérdezésekor.", error: err.message || err });
    }
});

// Esemény frissítése (csak saját)
router.put("/:id", tokencheck, async (req: any, res: any) => {
    try {
        const { userId } = req;

        // Esemény lekérdezése az ID alapján
        const event = await eventRepo.findOne({
            where: { id: req.params.id },
            relations: ["user"]
        });

        if (!event) return res.status(404).json({ message: "Esemény nem található." });

        if (event.userId.id !== userId) {
            return res.status(403).json({ message: "Nincs jogosultságod módosítani ezt az eseményt." });
        }

        const { title, description, startTime, endTime, color } = req.body;

        // Az esemény adatainak frissítése
        event.title = title ?? event.title;
        event.description = description ?? event.description;
        event.startTime = startTime ? new Date(startTime) : event.startTime;
        event.endTime = endTime ? new Date(endTime) : event.endTime;
        event.color = color ?? event.color;

        // Esemény mentése az adatbázisba
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
        const { userId } = req;

        // Esemény lekérdezése az ID alapján
        const event = await eventRepo.findOne({
            where: { id: req.params.id },
            relations: ["user"]
        });

        if (!event) return res.status(404).json({ message: "Esemény nem található." });

        if (event.userId.id !== userId) {
            return res.status(403).json({ message: "Nincs jogosultságod törölni ezt az eseményt." });
        }

        // Esemény törlése az adatbázisból
        await eventRepo.remove(event);
        res.json({ message: "Esemény törölve." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Hiba az esemény törlésekor.", error: err.message || err });
    }
});

export default router;
