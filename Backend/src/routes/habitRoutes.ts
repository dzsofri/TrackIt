import { Router } from "express";
import { AppDataSource } from "../data-source";
import { Habits } from "../entities/Habit";
import { tokencheck } from "../utiles/tokenUtils";
import { Users } from "../entities/User";  // Importáld a Users entitást
import { createGzip } from "zlib";

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
      select: ["id", "habitName", "status", "targetValue", "currentValue", "dailyTarget"],
      order: { createdAt: "DESC" }
    });

    return res.status(200).json(habits);
  } catch (error) {
    console.error("Hiba a szokások lekérdezésekor:", error);
    return res.status(500).json({ message: "Szerverhiba történt a lekérdezés során." });
  }
});

// POST /habits - új szokás létrehozása
// routes/habits.ts

router.post("/", tokencheck, async (req: any, res: any) => {
  try {
    const { habitName, userId, dailyTarget, targetValue, currentValue } = req.body;

    if (!habitName || !userId || dailyTarget === undefined || targetValue === undefined || currentValue === undefined) {
      return res.status(400).json({ message: "A habitName, userId, dailyTarget, targetValue és currentValue megadása kötelező." });
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


// PUT /habits/:habitId/status - szokás státuszának frissítése
router.put("/:habitId/status", tokencheck, async (req: any, res: any) => {
  try {
    const { habitId } = req.params;
    const { status } = req.body;

    if (!status || (status !== 'active' && status !== 'inactive')) {
      return res.status(400).json({ message: "A státusznak 'active' vagy 'inactive' értéknek kell lennie." });
    }

    const habitRepo = AppDataSource.getRepository(Habits);
    const habit = await habitRepo.findOne({ where: { id: habitId } });

    if (!habit) {
      return res.status(404).json({ message: "Szokás nem található." });
    }

    habit.status = status;
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


// DELETE /habits/:habitId - szokás törlése
router.delete("/:habitId", tokencheck, async (req: any, res: any) => {
  try {
    const { habitId } = req.params;

    const habitRepo = AppDataSource.getRepository(Habits);
    const habit = await habitRepo.findOne({ where: { id: habitId } });

    if (!habit) {
      return res.status(404).json({ message: "Szokás nem található." });
    }

    await habitRepo.remove(habit);

    return res.status(200).json({ message: "Szokás sikeresen törölve!" });
  } catch (error) {
    console.error("Hiba a szokás törlésekor:", error);
    return res.status(500).json({ message: "Szerverhiba történt a szokás törlése során." });
  }
});


export default router;
