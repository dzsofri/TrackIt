import express from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import dotenv from 'dotenv';

import { AppDataSource } from "./data-source";
import { seedDatabase } from "./utiles/DatabaseSeedUtils";

import userRoutes from "./routes/userRoutes";
import feedbackRoutes from "./routes/feedbackRoutes";
import friendRoutes from "./routes/friendRoutes";
import userStatisticsRoutes from "./routes/userStatisticsRoutes";
import taskRoutes from "./routes/taskRoutes";
import postRoutes from "./routes/postRoutes";
import challengeRoutes from "./routes/challengeRoutes";
import chatRoutes from "./routes/chatRoutes";

dotenv.config();

const app = express();
const server = http.createServer(app);

// 🔥 Attach socket.io to this server
const io = new Server(server, {
  cors: {
    origin: "http://localhost:4200", // your Angular app origin
    methods: ["GET", "POST"]
  }
});

// ✅ Setup socket.io events
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('message', (msg) => {
    console.log('Received message:', msg);
    io.emit('message', msg);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use("/users", userRoutes);
app.use("/feedbacks", feedbackRoutes);
app.use("/tasks", taskRoutes);
app.use("/friends", friendRoutes);
app.use("/user_statistics", userStatisticsRoutes);
app.use("/posts", postRoutes);
app.use("/challenges", challengeRoutes);
app.use("/chat", chatRoutes);

// Start everything
const PORT = process.env.PORT || 3000;

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

