import { Router } from "express";
import { Posts } from "../entities/Post";
import { AppDataSource } from "../data-source";

const router = Router();

router.get("/", async (req: any, res: any) => {
    try {
        const postRepository = AppDataSource.getRepository(Posts);

        const posts = await postRepository.find();
        const count = await postRepository.count();

        if (!posts.length) {
            return res.status(404).json({ message: "Nincsenek posztok az adatbázisban!", count: 0 });
        }

        return res.status(200).json({ posts, count });

    } catch (error) {
        console.error("Hiba történt a posztok lekérdezésekor:", error);
        return res.status(500).json({ message: "Szerverhiba történt." });
    }
});

export default router;
