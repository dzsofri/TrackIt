import { Router } from "express";
import { Posts } from "../entities/Post";
import { AppDataSource } from "../data-source";
const router = Router();


router.get("/", async (req: any, res: any) => {
    try {
        const tasks = await AppDataSource.getRepository(Posts).find();

        if (!tasks.length) {
            return res.status(404).json({ message: "Nincsenek poztok az adatbázisban!" });
        }

        return res.status(200).json({ tasks });

    } catch (error) {
        console.error("Hiba történt a posztok lekérdezésekor:", error);
        return res.status(500).json({ message: "Szerverhiba történt." });
    }
});


export default router;