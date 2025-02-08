import express from "express";
import { AppDataSource } from "../data-source";
import jwt from "jsonwebtoken";
import { Users, UserRole } from "../entities/User";

const app = express();
app.use(express.json());

// 📌 Admin jogosultság ellenőrzése
const isAdmin = async (req, res, next) => {
  try {
    const { id } = req.user; // Kinyerjük az id-t a req.user-ből
    if (!id) {
      return res.status(400).json({ message: "Felhasználói azonosító nem található a tokenben!" });
    }

    const user = await AppDataSource.getRepository(Users).findOne({ where: { id } });

    if (!user) {
      return res.status(404).json({ message: "Felhasználó nem található!" });
    }

    if (user.role !== UserRole.ADMIN) {
      return res.status(403).json({ message: "Hozzáférés megtagadva: csak adminok végezhetik ezt a műveletet!" });
    }

    next();
  } catch (error) {
    console.error("Hiba a jogosultság ellenőrzése során:", error);
    return res.status(500).json({ message: "Hiba történt a jogosultság ellenőrzése során." });
  }
};


export { isAdmin };
