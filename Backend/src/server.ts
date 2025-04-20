import express from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import dotenv from 'dotenv';

import { AppDataSource } from "./data-source";
import { seedDatabase } from "./utiles/DatabaseSeedUtils";

import userRoutes, { uploadsMiddleware } from "./routes/userRoutes";
import feedbackRoutes from "./routes/feedbackRoutes";
import mysql from 'mysql2';
import friendRoutes from "./routes/friendRoutes";
import userStatisticsRoutes from "./routes/userStatisticsRoutes";
import taskRoutes from "./routes/taskRoutes";
import postRoutes from "./routes/postRoutes";
import challengeRoutes from "./routes/challengeRoutes";
import chatRoutes from "./routes/chatRoutes"; // import chatRoutes
import path from "path";

dotenv.config();

const app = express();
const server = http.createServer(app);

app.use('/uploads', uploadsMiddleware);

// 🔥 Attach socket.io to this server
const io = new Server(server, {
  cors: {
    origin: "http://localhost:4200", // your Angular app origin
    methods: ["GET", "POST"]
  }
});

// A felhasználó státuszának beállítása: online, offline
const usersOnline = {}; // Online felhasználók

io.on('connection', (socket) => {
  console.log('🟢 User connected:', socket.id);

  // A felhasználó bejelentkezése és szobához való csatlakozás
  socket.on('joinPrivateRoom', (userId) => {
    socket.join(userId);
    usersOnline[userId] = socket.id; // Felhasználó online státuszának tárolása
    console.log(`User ${userId} joined the room`);

    // Frissítjük a felhasználó státuszát: online
    io.emit('userStatusChanged', { userId, status: 'online' });
  });

  // Üzenet küldése
  socket.on('privateMessage', (msg) => {
    console.log('Private message received:', msg);

    // Üzenet küldése a címzett szobájába
    socket.to(msg.receiverId).emit('messageReceived', msg);
    console.log('Message sent to room:', msg.receiverId, 'by:', msg.senderId);
  });

  // Felhasználó lecsatlakozása
  socket.on('disconnect', () => {
    for (const userId in usersOnline) {
      if (usersOnline[userId] === socket.id) {
        // Ha a felhasználó lecsatlakozik, offline státuszt küldünk
        io.emit('userStatusChanged', { userId, status: 'offline' });
        console.log(`User ${userId} is now offline`);
        delete usersOnline[userId]; // Töröljük a felhasználót az online listából
        break;
      }
    }
  });
});



// Middlewares
app.use(cors());
app.use(express.json());

// Routes
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
app.use("/chat", chatRoutes); // hozzáadjuk a chat routes-ot

// Start everything
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

    server.listen(PORT, () => {
      console.log(`🚀 Server running with Socket.IO at http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Hiba történt az adatbázis kapcsolat során:", err);
  });
