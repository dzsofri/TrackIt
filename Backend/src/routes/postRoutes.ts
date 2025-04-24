import express,{ Router } from "express";
import { Posts } from "../entities/Post";
import { AppDataSource } from "../data-source";
import { Between } from "typeorm";
import { tokencheck } from "../utiles/tokenUtils";
import { Pictures } from "../entities/Picture";
import { v4 as uuidv4 } from 'uuid';
import path from "path";
import multer from 'multer';
import { db } from "../server";

const router = Router();


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
      const uniqueName = uuidv4() + path.extname(file.originalname);
      cb(null, uniqueName);
    }
  });
  const upload = multer({ storage });
  router.use('/uploads', express.static('uploads'));

  router.get("/all", async (req: any, res: any) => {
    try {
      const postRepository = AppDataSource.getRepository(Posts);
      const posts = await postRepository.find({
        relations: ["picture"], // hozzáadjuk a picture relációt
      });
  
      const count = posts.length;
  
      if (count === 0) {
        return res.status(404).json({ message: "Nincsenek posztok az adatbázisban.", count: 0 });
      }
  
      const transformedPosts = posts.map(post => {
        const imageUrl = post.picture && post.picture.filename
    ? `http://localhost:3000/uploads/${post.picture.filename}`
    : null;

  
        return {
          ...post,
          imageUrl,
        };
      });
  
      return res.status(200).json({ posts: transformedPosts, count });
    } catch (error) {
      console.error("Hiba történt a posztok lekérdezésekor:", error);
      return res.status(500).json({ message: "Szerverhiba történt." });
    }
  });

  


router.get("/by-month", tokencheck, async (req: any, res: any) => {
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

// Poszt létrehozás kép nélkül



export default router;
