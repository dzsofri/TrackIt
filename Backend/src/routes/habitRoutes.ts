import { Router } from "express";
import { AppDataSource } from "../data-source";
import { Habits } from "../entities/Habit";
import { tokencheck } from "../utiles/tokenUtils";
import { v4 as uuidv4 } from "uuid";

const router = Router();

// POST /habits - új szokás létrehozása
router.post("/", tokencheck, async (req: any, res: any) => {
  try {
    const { habitName, targetValue, currentValue, frequency, userId } = req.body;

    const invalidFields: string[] = [];

    if (!habitName) invalidFields.push("habitName");
    if (!targetValue && targetValue !== 0) invalidFields.push("targetValue");
    if (!frequency) invalidFields.push("frequency");
    if (!userId) invalidFields.push("userId");

    if (invalidFields.length) {
      return res.status(400).json({
        message: "Hiányzó kötelező mezők!",
        invalid: invalidFields,
      });
    }

    const habitRepo = AppDataSource.getRepository(Habits);

    const newHabit = habitRepo.create({
        habitName,
        targetValue,
        currentValue: currentValue || 0,
        frequency,
        user: { id: userId }, // csak az ID is elég, nem kell lekérni teljes objektumként
        status: 'inactive',   // <<< ez automatikus is lehet, de így egyértelmű
      });

    await habitRepo.save(newHabit);

    return res.status(201).json({
      message: "Szokás sikeresen létrehozva!",
      habit: newHabit,
    });
  } catch (error) {
    console.error("Hiba a szokás létrehozásakor:", error);
    return res.status(500).json({ message: "Szerverhiba történt a szokás mentése közben." });
  }
});

export default router;
