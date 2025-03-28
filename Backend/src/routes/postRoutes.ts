import { Router } from "express";
import { Posts } from "../entities/Post";
import { AppDataSource } from "../data-source";
import { Between } from "typeorm";
import { tokencheck } from "../utiles/tokenUtils";
import { isAdmin } from "../utiles/adminUtils";

const router = Router();


router.get("/all", async (req: any, res: any) => {
    try {
        const postRepository = AppDataSource.getRepository(Posts);

        const posts = await postRepository.find();
        const count = posts.length;

        if (count === 0) {
            return res.status(404).json({ message: "Nincsenek posztok az adatbázisban.", count: 0 });
        }

        return res.status(200).json({ posts, count });
    } catch (error) {
        console.error("Hiba történt a posztok lekérdezésekor:", error);
        return res.status(500).json({ message: "Szerverhiba történt." });
    }
});


router.get("/by-month",tokencheck, async (req: any, res: any) => {
    try {
        const postRepository = AppDataSource.getRepository(Posts);


        const { month, year } = req.query;

        const currentDate = new Date();
        const selectedMonth = month ? parseInt(month) - 1 : currentDate.getMonth(); 
        const selectedYear = year ? parseInt(year) : currentDate.getFullYear();

        
        const startOfMonth = new Date(selectedYear, selectedMonth, 1);
        const endOfMonth = new Date(selectedYear, selectedMonth + 1, 0, 23, 59, 59, 999); 

       
        const posts = await postRepository.find({
            where: {
                createdAt: Between(startOfMonth, endOfMonth),  
            },
        });

        const count = posts.length;

        if (count === 0) {
            return res.status(404).json({ message: "Nincsenek posztok az adott hónapban.", count: 0 });
        }

        return res.status(200).json({ posts, count });
    } catch (error) {
        console.error("Hiba történt a posztok lekérdezésekor:", error);
        return res.status(500).json({ message: "Szerverhiba történt." });
    }
});


router.get("/all-by-month", async (req: any, res: any) => {
    try {
        const postRepository = AppDataSource.getRepository(Posts);

        
        const posts = await postRepository.find();
        
        if (!posts.length) {
            return res.status(404).json({ message: "Nincsenek posztok az adatbázisban." });
        }

        
        const postsByMonth: { [key: string]: Posts[] } = {};

        posts.forEach(post => {
            const createdMonth = post.createdAt.getMonth(); 
            const createdYear = post.createdAt.getFullYear();
            const monthYearKey = `${createdYear}-${createdMonth + 1}`; 

            if (!postsByMonth[monthYearKey]) {
                postsByMonth[monthYearKey] = [];
            }

            postsByMonth[monthYearKey].push(post);
        });

       
        return res.status(200).json({ postsByMonth });
    } catch (error) {
        console.error("Hiba történt a posztok hónapokra bontása során:", error);
        return res.status(500).json({ message: "Szerverhiba történt." });
    }
});

router.post("/create", tokencheck, async (req: any, res: any) => {
    try {
        const { title, body, status } = req.body;
        const userId = req.user.id;  // Tokenből kapjuk a user ID-t
        const createdAt = new Date();

        if (!userId) {
            return res.status(401).json({ message: "Felhasználói azonosító nem található a tokenben." });
        }

        const postRepository = AppDataSource.getRepository(Posts);

        const newPost = postRepository.create({
            title,
            body,
            userId,
            createdAt,
            status
        });

        await postRepository.save(newPost);

        return res.status(201).json({ message: "Bejegyzés sikeresen létrehozva!", post: newPost });
    } catch (error) {
        console.error("Hiba a bejegyzés létrehozásakor:", error);
        return res.status(500).json({ message: "Szerverhiba történt." });
    }
});



export default router;
