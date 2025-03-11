import express from "express";
import cors from "cors";
import userRoutes from "./routes/userRoutes";
import feedbackRoutes from "./routes/feedbackRoutes";
import { AppDataSource } from "./data-source";
import { seedDatabase } from "./utiles/DatabaseSeedUtils";
import dotenv from 'dotenv'; // dotenv importálása
import mysql from 'mysql2'; // mysql2 importálása ESM-ben
import friendRoutes from "./routes/friendRoutes";
import userStatisticsRoutes from "./routes/userStatisticsRoutes";
import taskRoutes from "./routes/taskRoutes";
import postRoutes from "./routes/postRoutes";

dotenv.config(); // Környezeti változók betöltése

const app = express();

app.use(cors());
app.options("*", cors()); // Az összes útvonalra engedélyezi az OPTIONS metódust
app.use(express.json());
app.use("/users", userRoutes);
app.use("/feedbacks", feedbackRoutes);
app.use("/tasks", taskRoutes);
app.use("/friends", friendRoutes);
app.use("/user_statsitics", userStatisticsRoutes);
app.use("/posts", postRoutes);

const PORT = process.env.PORT || 3000;


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
