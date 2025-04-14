import { Router } from "express";
import { AppDataSource } from "../data-source";  // Az adatbázis kapcsolat
import { Chat } from "../entities/Chat";  // Chat entitás
import { Users } from "../entities/User";  // Users entitás
import { tokencheck } from "../utiles/tokenUtils";  // Token ellenőrzés

const router = Router();

// Üzenet küldése
router.post("/send", tokencheck, async (req: any, res: any) => {
    try {
        const { senderId, receiverId, message } = req.body;

        // Ellenőrzés, hogy minden mező ki van-e töltve
        if (!senderId || !receiverId || !message) {
            return res.status(400).json({ message: "Minden mező kitöltése szükséges." });
        }

        // Felhasználók lekérése az ID-k alapján
        const userRepository = AppDataSource.getRepository(Users);
        const sender = await userRepository.findOneBy({ id: senderId });
        const receiver = await userRepository.findOneBy({ id: receiverId });

        if (!sender || !receiver) {
            return res.status(404).json({ message: "Felhasználó nem található." });
        }

        // Üzenet mentése
        const chatRepository = AppDataSource.getRepository(Chat);
        const chat = new Chat();
        chat.sender = sender;
        chat.receiver = receiver;
        chat.message = message;

        await chatRepository.save(chat);

        return res.status(201).json({ message: "Üzenet sikeresen elküldve!" });
    } catch (error) {
        console.error("Hiba történt az üzenet küldésekor:", error);
        return res.status(500).json({ message: "Szerverhiba történt." });
    }
});

// Két felhasználó közötti üzenetek lekérése
router.get('/messages/:user1Id/:user2Id', tokencheck, async (req: any, res: any) => {
    try {
        const { user1Id, user2Id } = req.params;
        const chatRepository = AppDataSource.getRepository(Chat);
        const userRepository = AppDataSource.getRepository(Users);

        // Felhasználók lekérése az ID-k alapján
        const sender = await userRepository.findOne({ where: { id: user1Id } });
        const receiver = await userRepository.findOne({ where: { id: user2Id } });

        if (!sender || !receiver) {
            return res.status(404).json({ message: "Felhasználó nem található." });
        }

        // Üzenetek keresése két felhasználó között
        const messages = await chatRepository.find({
            where: [
                { sender: { id: sender.id }, receiver: { id: receiver.id } },
                { sender: { id: receiver.id }, receiver: { id: sender.id } }
            ],
            order: {
                createdAt: "ASC" // Ha idő szerint akarod rendezni az üzeneteket
            }
        });

        // Ha nincsenek üzenetek
        if (!messages || messages.length === 0) {
            return res.status(200).json({ message: 'Nincs üzenet.', messages: [] });
        }

        // Üzenetek válaszként
        res.json(messages);
    } catch (error) {
        console.error('Hiba történt az üzenetek lekérésekor:', error);
        res.status(500).json({ message: 'Szerverhiba történt.' });
    }
});

export default router;
