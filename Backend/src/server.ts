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
import chatRoutes from "./routes/chatRoutes"; // import chatRoutes

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
  console.log('🟢 User connected:', socket.id);

  socket.on('joinPrivateRoom', (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined the room`);
  });
  

  // Üzenet küldése a privát szobába
  socket.on('privateMessage', (msg) => {
    console.log('Private message received:', msg);
  
    // Send message to the receiver's room
    socket.to(msg.receiverId).emit('messageReceived', msg);
    console.log('Message sent to room:', msg.receiverId, 'by:', msg.senderId);
  });
  
  socket.on('disconnect', () => {
    console.log('🔴 User disconnected:', socket.id);
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
app.use("/chat", chatRoutes); // hozzáadjuk a chat routes-ot

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
