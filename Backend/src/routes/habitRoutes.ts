import { Router } from "express";
import { AppDataSource } from "../data-source";
import { Habits } from "../entities/Habit";
import { tokencheck } from "../utiles/tokenUtils";

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


export default router;
