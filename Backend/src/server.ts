import express from "express";
import cors from "cors";
import userRoutes from "./routes/userRoutes";
import { AppDataSource } from "./data-source";
import { seedDatabase } from "./utiles/DatabaseSeedUtils";
import dotenv from 'dotenv'; // dotenv importálása
import mysql from 'mysql2'; // mysql2 importálása ESM-ben

dotenv.config(); // Környezeti változók betöltése

const app = express();

app.use(cors());
app.use(express.json());
app.use("/users", userRoutes);

const PORT = process.env.PORT || 3000;
const SECRET_KEY = process.env.JWT_SECRET; // Korrekt környezeti változó használata

const db = mysql.createConnection({
  host: process.env.DBHOST,
  user: process.env.DBUSER,
  password: process.env.DBPASS,
  database: process.env.DBNAME,
});

AppDataSource.initialize()
  .then(async () => {
    console.log("✅ Adatbázis sikeresen csatlakoztatva!");
    await seedDatabase(); 

    app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Hiba történt az adatbázis kapcsolat során:", err);
  });

export { db };
