import express from "express";
import cors from "cors";
import userRoutes from "./routes/userRoutes";
import { AppDataSource } from "./data-source";
import mysql from 'mysql';
import { seedDatabase } from "./utiles/DatabaseSeedUtils";
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());
app.use("/users", userRoutes);


const PORT = process.env.PORT || 3000;
const SECRET_KEY = process.env.JWT_SECRET;  // Korrekt környezeti változó használata

app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: process.env.DBHOST,
  user: process.env.DBUSER,
  password: process.env.DBPASS,
  database: process.env.DBNAME
});



// 🔹 Az AppDataSource-t itt inicializáljuk, ÉS csak egyszer!
AppDataSource.initialize()
  .then(async () => {
    console.log("✅ Adatbázis sikeresen csatlakoztatva!");
    
    await seedDatabase(); 

    app.listen(3000, () => {
      console.log(`🚀 Server running at http://localhost:3000`);
    });
  })
  .catch((err) => {
    console.error("❌ Hiba történt az adatbázis kapcsolat során:", err);
  });

  export {db};