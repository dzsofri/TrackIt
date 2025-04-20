import express,{ Router } from "express";
import { Posts } from "../entities/Post";
import { AppDataSource } from "../data-source";
import { Between } from "typeorm";
import { tokencheck } from "../utiles/tokenUtils";
import { Pictures } from "../entities/Picture";
import { v4 as uuidv4 } from 'uuid';
import path from "path";
import multer from 'multer';

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
  


  router.post("/", tokencheck, upload.single("picture"), async (req: any, res: any) => {
    try {
        const { title, body, status } = req.body;
        const userId = req.user.id;
        const createdAt = new Date();

        if (!userId) {
            return res.status(401).json({ message: "Felhasználói azonosító nem található a tokenben." });
        }

        const postRepository = AppDataSource.getRepository(Posts);
        const pictureRepository = AppDataSource.getRepository(Pictures);

        let pictureId: string | null = null;

        if (req.file) {
            const newPicture = pictureRepository.create({
                id: uuidv4(),
                filename: req.file.filename,
                path: req.file.path,
            });
            const savedPicture = await pictureRepository.save(newPicture);
            pictureId = savedPicture.id;
        }

        const newPost = postRepository.create({
            title,
            body,
            userId,
            createdAt,
            status: status || 'published',
            pictureId,
        });

        await postRepository.save(newPost);

        const imageUrl = req.file ? `http://localhost:3000/uploads/${req.file.filename}` : null;

        return res.status(201).json({
            message: "Poszt létrehozva!",
            post: {
                ...newPost,
                imageUrl,
            },
        });
    } catch (error) {
        console.error("Hiba a poszt létrehozásánál:", error);
        return res.status(500).json({ message: "Szerverhiba." });
    }
});


router.put("/:id", tokencheck, upload.single("picture"), async (req: any, res: any) => {
    try {
        const { id } = req.params;
        const { title, body, status } = req.body;
        const userId = req.user.id;
        const postRepository = AppDataSource.getRepository(Posts);
        const pictureRepository = AppDataSource.getRepository(Pictures);

        // Lekérdezzük a posztot
        const post = await postRepository.findOne({ where: { id }, relations: ['picture'] });
        
        if (!post) {
            return res.status(404).json({ message: "Poszt nem található." });
        }

        // Ellenőrizzük, hogy a felhasználó jogosult-e a poszt módosítására
        if (post.userId !== userId) {
            return res.status(403).json({ message: "Nincs jogosultságod a poszt módosítására." });
        }

        // Csak a megengedett mezők frissítése
        post.title = title || post.title;
        post.body = body || post.body;
        post.status = status || post.status;

        // Ha új képet töltenek fel
        if (req.file) {
            // Előző kép törlése, ha van
            if (post.pictureId) {
                const oldPicture = await pictureRepository.findOne({ where: { id: post.pictureId } });
                if (oldPicture) {
                    // Törölheted a fájlt is a szerverről, ha szükséges
                    // fs.unlinkSync(oldPicture.path); // Ha a fájlt is törölni kell
                    await pictureRepository.remove(oldPicture);
                }
            }

            // Új kép hozzáadása
            const newPicture = pictureRepository.create({
                id: uuidv4(),
                filename: req.file.filename,
                path: req.file.path,
            });

            const savedPicture = await pictureRepository.save(newPicture);
            post.pictureId = savedPicture.id;  // Frissítjük a poszt képe ID-ját
        }

        // Poszt mentése
        await postRepository.save(post);

        const imageUrl = req.file ? `http://localhost:3000/uploads/${req.file.filename}` : null;

        return res.status(200).json({
            message: "Poszt frissítve!",
            post: {
                ...post,
                imageUrl,  // Ha van kép, akkor URL is szerepel
            },
        });
    } catch (error) {
        console.error("Hiba a poszt frissítésekor:", error);
        return res.status(500).json({ message: "Szerverhiba." });
    }
});



router.delete("/:id", tokencheck, async (req: any, res: any) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const postRepository = AppDataSource.getRepository(Posts);
        const pictureRepository = AppDataSource.getRepository(Pictures);

        // A poszt keresése az adatbázisban, kapcsolódó képpel együtt
        const post = await postRepository.findOne({ where: { id }, relations: ['picture'] });

        // Ha nem találjuk a posztot, 404-es hiba
        if (!post) {
            return res.status(404).json({ message: "A poszt nem található." });
        }

        // Ellenőrizzük, hogy a felhasználó jogosult-e a poszt törlésére
        if (post.userId !== userId) {
            return res.status(403).json({ message: "Nincs jogosultságod a poszt törlésére." });
        }

        // A poszt törlése az adatbázisból
        await postRepository.remove(post);

        return res.status(200).json({ message: "A poszt sikeresen törölve, a kép megmaradt." });
    } catch (error) {
        console.error("Hiba a poszt törlésekor:", error);
        return res.status(500).json({ message: "Hiba történt a poszt törlésénél." });
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
