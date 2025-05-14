import express from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { AppDataSource } from "./data-source";
import { seedDatabase } from "./utiles/DatabaseSeedUtils";
import mysql from "mysql2";
import { v4 as uuidv4 } from "uuid";

// Route-ok és middleware-ek
import userRoutes, { uploadsMiddleware } from "./routes/userRoutes";
import feedbackRoutes from "./routes/feedbackRoutes";
import friendRoutes from "./routes/friendRoutes";
import userStatisticsRoutes from "./routes/userStatisticsRoutes";

import postRoutes from "./routes/postRoutes";
import challengeRoutes from "./routes/challengeRoutes";
import commentRoutes from "./routes/commentRoutes";  // Assuming your comment routes are in this file

// Correctly use commentRoutes


import chatRoutes from "./routes/chatRoutes"; // import chatRoutes
import eventRoutes from "./routes/eventRoutes";

// Entitások
import { Badges } from "./entities/Badges";
import habitRoutes from "./routes/habitRoutes";
import taskRoutes from "./routes/taskRoutes";


dotenv.config();

// Alkalmazás létrehozása
const app = express();
const server = http.createServer(app);

// ========= Statikus fájlkezelés =========
const uploadsPath = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadsPath)) {
    fs.mkdirSync(uploadsPath, { recursive: true });
}
app.use("/uploads", express.static(uploadsPath));
app.use("/uploads", uploadsMiddleware); // ha szükséges middleware hozzá

// ========= Alap Middleware-ek =========
app.use(express.json());
app.use(
    cors({
        origin: "http://localhost:4200",
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
        allowedHeaders: ["Content-Type", "Authorization", "Origin"],
        credentials: true,
    })
);

// ========= Socket.IO =========
const io = new Server(server, {
    cors: {
        origin: "http://localhost:4200",
        methods: ["GET", "POST"],
    },
});

const usersOnline: Record<string, string> = {};

io.on("connection", (socket) => {
    console.log("🟢 User connected:", socket.id);

    socket.on("joinPrivateRoom", (userId) => {
        socket.join(userId);
        usersOnline[userId] = socket.id;
        console.log(`User ${userId} joined the room`);
        io.emit("userStatusChanged", { userId, status: "online" });
    });

    socket.on("privateMessage", (msg) => {
        console.log("Private message received:", msg);
        socket.to(msg.receiverId).emit("messageReceived", msg);
        console.log("Message sent to room:", msg.receiverId, "by:", msg.senderId);
    });

    socket.on("disconnect", () => {
        for (const userId in usersOnline) {
            if (usersOnline[userId] === socket.id) {
                io.emit("userStatusChanged", { userId, status: "offline" });
                console.log(`User ${userId} is now offline`);
                delete usersOnline[userId];
                break;
            }
        }
    });
});

// ========= Route-ok =========
app.use("/users", userRoutes);
app.use("/feedbacks", feedbackRoutes);
app.use("/tasks", taskRoutes);
app.use("/friends", friendRoutes);
app.use("/user_statistics", userStatisticsRoutes);
app.use("/posts", postRoutes);
app.use("/challenges", challengeRoutes);
app.use("/chat", chatRoutes);
app.use("/comments", commentRoutes);
app.use("/events", eventRoutes);

app.use("/habits", habitRoutes);

// ========= MySQL kapcsolat =========
const db = mysql.createConnection({
    host: process.env.DBHOST,
    user: process.env.DBUSER,
    password: process.env.DBPASS,
    database: process.env.DBNAME,
});

// ========= Badge seedelés =========
async function seedPictures() {
    const pictureRepo = AppDataSource.getRepository(Badges);
    const count = await pictureRepo.count();
    if (count > 0) return;

    const filenames = [
        "Csillag.png",
        "Gyémánt.png",
        "Kedvel.png",
        "Kézfogás.png",
        "Mosoly.png",
        "Trófea.png",
    ];

    for (const filename of filenames) {
        const newPicture = new Badges();
        newPicture.id = uuidv4();
        newPicture.filename = filename;
        newPicture.path = `/uploads/${filename}`;
        await pictureRepo.save(newPicture);
    }
}


// ========= App indítása =========
app.use("/chat", chatRoutes);
app.use("/events", eventRoutes);

// Start everything
const PORT = process.env.PORT || 3000;

AppDataSource.initialize()
    .then(async () => {
        console.log("✅ Adatbázis sikeresen csatlakoztatva!");
        await seedDatabase();
        await seedPictures();

        server.listen(PORT, () => {
            console.log(`🚀 Server running with Socket.IO at http://localhost:${PORT}`);
        });
    })
    .catch((err) => {
        console.error("❌ Hiba történt az adatbázis kapcsolat során:", err);
    });
