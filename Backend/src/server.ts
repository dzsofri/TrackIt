import express from "express";
import cors from "cors";
import userRoutes from "./routes/userRoutes";
import feedbackRoutes from "./routes/feedbackRoutes";
import { AppDataSource } from "./data-source";
import { seedDatabase } from "./utiles/DatabaseSeedUtils";
import dotenv from 'dotenv'; 
import mysql from 'mysql2';
import friendRoutes from "./routes/friendRoutes";
import userStatisticsRoutes from "./routes/userStatisticsRoutes";
import taskRoutes from "./routes/taskRoutes";
import postRoutes from "./routes/postRoutes";
import challengeRoutes from "./routes/challengeRoutes";
import path from "path";

dotenv.config(); // Környezeti változók betöltése

const app = express();

// CORS beállítások
app.use(cors({
  origin: 'http://localhost:4200',  // A frontend URL-je
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin'],
  credentials: true,  // Fontos, ha session vagy cookie-kat használsz
}));


app.options("*", cors()); 

app.use(express.json());

// Képek statikus kiszolgálása
// Backend oldali statikus fájlok kiszolgálása
app.use('/uploads', express.static('uploads'))


app.use("/users", userRoutes);
app.use("/feedbacks", feedbackRoutes);
app.use("/tasks", taskRoutes);
app.use("/friends", friendRoutes);
app.use("/user_statistics", userStatisticsRoutes);
app.use("/posts", postRoutes);
app.use("/challenges", challengeRoutes);


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
