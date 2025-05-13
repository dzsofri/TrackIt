import { Router } from "express";
import { AppDataSource } from "../data-source";
import { Habits } from "../entities/Habit";
import { tokencheck } from "../utiles/tokenUtils";
import { v4 as uuidv4 } from "uuid";
import { HabitTrackings } from "../entities/HabitTracking";
const jwt = require('jsonwebtoken');

const router = Router();

// GET /habits - felhasználó szokásainak lekérdezése
router.get("/:userId", tokencheck, async (req: any, res: any) => {
  try {
    const userId = req.params.userId;

    if (!userId) {
      return res.status(400).json({ message: "Hiányzó userId a lekérdezéshez." });
    }

    const habitRepo = AppDataSource.getRepository(Habits);
    const habits = await habitRepo.find({
      where: { user: { id: userId } },
      select: ["id", "habitName", "status"],
      order: { createdAt: "DESC" }
    });

    return res.status(200).json(habits);
  } catch (error) {
    console.error("Hiba a szokások lekérdezésekor:", error);
    return res.status(500).json({ message: "Szerverhiba történt a lekérdezés során." });
  }
});



// POST /habits - új szokás létrehozása
router.post("/", tokencheck, async (req: any, res: any) => {
  try {
    const { habitId, value, achieved, date } = req.body;

    if (!habitId || !date) {
      return res.status(400).json({ message: "Hiányzó kötelező mezők!" });
    }

    const habitRepo = AppDataSource.getRepository(Habits);
    const trackingRepo = AppDataSource.getRepository(HabitTrackings);

    const habit = await habitRepo.findOne({ where: { id: habitId } });
    if (!habit) return res.status(404).json({ message: "Szokás nem található." });

    const tracking = trackingRepo.create({
      habit,
      value,
      achieved,
      date
    });

    await trackingRepo.save(tracking);
    return res.status(201).json({ message: "Tracking sikeresen elmentve!" });
  } catch (error) {
    console.error("Tracking mentési hiba:", error);
    return res.status(500).json({ message: "Szerverhiba történt." });
  }
});

// PUT /habits/:habitId/status - szokás státuszának frissítése
router.put("/:habitId/status", tokencheck, async (req: any, res: any) => {
  try {
    const { habitId } = req.params; // Az ID-t paraméterként várjuk
    const { status } = req.body;   // A státuszt a kérés testjében kapjuk

    // Ellenőrizzük, hogy a státusz megfelelő értéket kapott-e
    if (!status || (status !== 'active' && status !== 'inactive')) {
      return res.status(400).json({ message: "A státusznak 'active' vagy 'inactive' értéknek kell lennie." });
    }

    const habitRepo = AppDataSource.getRepository(Habits);

    // Megkeressük a szokást az ID alapján
    const habit = await habitRepo.findOne({ where: { id: habitId } });

    if (!habit) {
      return res.status(404).json({ message: "Szokás nem található." });
    }

    // Frissítjük a szokás státuszát
    habit.status = status;

    // Mentjük az új adatokat az adatbázisba
    await habitRepo.save(habit);

    return res.status(200).json({
      message: "Szokás státusza sikeresen frissítve!",
      habit: habit,
    });
  } catch (error) {
    console.error("Hiba a szokás státuszának frissítésekor:", error);
    return res.status(500).json({ message: "Szerverhiba történt a státusz frissítése közben." });
  }
});


export default router;
