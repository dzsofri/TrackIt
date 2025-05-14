import { Router } from "express";
import { AppDataSource } from "../data-source";
import { Habits } from "../entities/Habit";
import { tokencheck } from "../utiles/tokenUtils";
import { Users } from "../entities/User";  // Importáld a Users entitást

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
      select: ["id", "habitName", "status", "targetValue", "currentValue", "dailyTarget", "completed", "createdAt", "unit"], // Added unit field
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
    const { habitName, userId, dailyTarget, targetValue, currentValue, unit, createdAt } = req.body;

    if (!habitName || !userId || dailyTarget === undefined || targetValue === undefined || currentValue === undefined || unit === undefined) {
      return res.status(400).json({ message: "A habitName, userId, dailyTarget, targetValue, unit és currentValue megadása kötelező." });
    }

    const habitRepo = AppDataSource.getRepository(Habits);
    const userRepo = AppDataSource.getRepository(Users);  // Hozzáférés a Users repository-hoz

    // Keresd meg a felhasználót a userId alapján
    const user = await userRepo.findOne({ where: { id: userId } });

    if (!user) {
      return res.status(404).json({ message: "Felhasználó nem található." });
    }

    const habit = new Habits();
    habit.habitName = habitName;
    habit.dailyTarget = dailyTarget;
    habit.targetValue = targetValue;
    habit.currentValue = currentValue;
    habit.status = "inactive";  // Alapértelmezett státusz
    habit.createdAt = createdAt; 
    habit.completed = false; // Létrehozás dátuma
    habit.unit = unit;  // Mértékegység beállítása
  
    habit.user = user;  // A teljes User entitást rendeld hozzá a habit.user-hez

    await habitRepo.save(habit);

    return res.status(201).json({
      message: "Szokás sikeresen létrehozva!",
      habit: habit,
    });
  } catch (error) {
    console.error("Hiba a szokás létrehozásakor:", error);
    return res.status(500).json({ message: "Szerverhiba történt a szokás létrehozása során." });
  }
});

// PUT /habits/:habitId - szokás napi teljesítésének frissítése
// PUT /habits/:habitId - szokás napi teljesítésének frissítése
router.put("/:habitId", tokencheck, async (req: any, res: any) => {
  try {
    const { habitId } = req.params;
    const { currentValue, completed } = req.body;  // Frissítjük a napi aktuális értéket és a completed státuszt

    if (currentValue === undefined || currentValue < 0) {
      return res.status(400).json({ message: "Érvénytelen 'currentValue'." });
    }

    const habitRepo = AppDataSource.getRepository(Habits);
    const habit = await habitRepo.findOne({ where: { id: habitId } });

    if (!habit) {
      return res.status(404).json({ message: "Szokás nem található." });
    }

    await habitRepo.save(habit);

    return res.status(200).json({
      message: "Szokás napi teljesítése frissítve!",
      habit,
    });
  } catch (error) {
    console.error("Hiba a szokás napi teljesítésének frissítésekor:", error);
    return res.status(500).json({ message: "Szerverhiba történt a szokás napi teljesítésének frissítésekor." });
  }
});


// PUT /habits/:habitId/completed - szokás "completed" mező frissítése
// PUT /habits/:habitId/completed - szokás "completed" mező frissítése
router.put("/completed/:habitId", tokencheck, async (req:any, res:any) => {
  try {
    const { habitId } = req.params;
    const { completed } = req.body;

    const habitRepo = AppDataSource.getRepository(Habits);
    const habit = await habitRepo.findOne({ where: { id: habitId } });

    if (!habit) {
      return res.status(404).json({ message: "Szokás nem található." });
    }

    habit.completed = completed;

    // Ha completed true, akkor beállítjuk a currentValue-t, ha false, akkor 0-ra
    habit.currentValue = completed ? habit.targetValue : "0";

    await habitRepo.save(habit);

    return res.status(200).json({
      message: "Szokás 'completed' mezője frissítve.",
      habit,
    });
  } catch (error) {
    console.error("Hiba a 'completed' mező frissítésekor:", error);
    return res.status(500).json({ message: "Szerverhiba a frissítés során." });
  }
});


export default router;
