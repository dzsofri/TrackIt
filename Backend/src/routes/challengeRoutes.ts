import { Router } from "express";
import { AppDataSource } from "../data-source";
import { UserChallenges } from "../entities/UserChallenge";
const router = Router();


router.get("/", async (req: any, res: any) => {
    try {
        const challengeRepository = AppDataSource.getRepository(UserChallenges);

      
        const tasks = await challengeRepository.find();
        const count = await challengeRepository.count(); 

        if (!tasks.length) {
            return res.status(404).json({ message: "Nincsenek kihívások az adatbázisban!", count: 0 });
        }

        return res.status(200).json({ tasks, count });

    } catch (error) {
        console.error("Hiba történt a kihívások lekérdezésekor:", error);
        return res.status(500).json({ message: "Szerverhiba történt." });
    }
});



export default router;