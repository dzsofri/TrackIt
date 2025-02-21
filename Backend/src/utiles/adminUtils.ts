import { Request, Response, NextFunction } from "express";
import { AppDataSource } from "../data-source";
import { Users, UserRole } from "../entities/User";

const isAdmin = async (req: any, res: any, next: any) => {
  try {
    const userId = req.user?.id; // Kinyerjük az id-t a req.user-ből

    if (!userId) {
      return res.status(400).json({ message: "Felhasználói azonosító nem található a tokenben!" });
    }

    const user = await AppDataSource.getRepository(Users).findOne({ where: { id: userId } });

    if (!user) {
      return res.status(404).json({ message: "Felhasználó nem található!" });
    }

    // Ellenőrzés, hogy a felhasználó admin-e
    if (user.role !== UserRole.ADMIN) {
      return res.status(403).json({ message: "Hozzáférés megtagadva: csak adminok végezhetik ezt a műveletet!" });
    }

    next(); // Továbbengedés a következő middleware-hez
  } catch (error) {
    console.error("Hiba a jogosultság ellenőrzése során:", error);
    return res.status(500).json({ message: "Hiba történt a jogosultság ellenőrzése során." });
  }
};

export { isAdmin };
