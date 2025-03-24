import { Router } from "express";
import { AppDataSource } from "../data-source";
import { FriendRequests } from "../entities/FriendRequest";
import { Users } from "../entities/User";
import { tokencheck } from "../utiles/tokenUtils";
import { Follows } from "../entities/Follow";
import { Brackets } from "typeorm";

const router = Router();

// Barátkérés küldése
router.post("/send-friendrequest", tokencheck, async (req: any, res: any) => {
    const { receiverId } = req.body;
    const senderId = req.user.id;
    const invalidFields: string[] = [];

    // Érvényesítés: címzett azonosító ellenőrzése
    if (!receiverId) {
        invalidFields.push("receiverId");
    }

    if (invalidFields.length > 0) {
        return res.status(400).json({ error: "Kérjük, adja meg a címzett azonosítóját!", invalidFields });
    }

    try {
        // Ellenőrzés: van-e már aktív barátkérés
        const existingRequest = await AppDataSource.getRepository(FriendRequests).findOne({
            where: {
                senderId: senderId,
                receiverId: receiverId,
                status: "pending"
            }
        });

        if (existingRequest) {
            return res.status(400).json({ error: "Már elküldted a barátkérést ennek a felhasználónak!" });
        }

        const sender = await AppDataSource.getRepository(Users).findOneOrFail({ where: { id: senderId } });
        const receiver = await AppDataSource.getRepository(Users).findOneOrFail({ where: { id: receiverId } });

        const friendRequest = new FriendRequests();
        friendRequest.sender = sender;
        friendRequest.receiver = receiver;
        friendRequest.senderId = senderId;
        friendRequest.receiverId = receiverId;
        friendRequest.status = "pending";

        await AppDataSource.getRepository(FriendRequests).save(friendRequest);
        res.status(201).json({ message: "A barátkérés sikeresen elküldve!" });
    } catch (error) {
        res.status(500).json({ error: "Hiba történt a barátkérés küldése közben." });
    }
});

// Barátkérés elfogadása
router.post("/friendrequests/:id/accept", tokencheck, async (req: any, res: any) => {
    const { id } = req.params;
    const userId = req.user.id;
 
    try {
        const friendRequest = await AppDataSource.getRepository(FriendRequests).findOneOrFail({ where: { id } });
 
        if (friendRequest.receiverId !== userId) {
            return res.status(403).json({ error: "Nincs jogosultságod a barátkérés elfogadásához." });
        }
 
        friendRequest.status = "accepted";
        await AppDataSource.getRepository(FriendRequests).save(friendRequest);
 
        const followRelation = new Follows();
        followRelation.followerUser = friendRequest.sender;
        followRelation.followedUser = friendRequest.receiver;
        followRelation.followerUserId = friendRequest.senderId;
        followRelation.followedUserId = friendRequest.receiverId;
 
        await AppDataSource.getRepository(Follows).save(followRelation);
 
        res.json({ message: "A barátkérés elfogadva és a követés létrehozva!" });
    } catch (error) {
        res.status(404).json({ error: "A barátkérés nem található." });
    }
});


// Barátkérés elutasítása
router.delete("/friendrequests/:id", tokencheck, async (req: any, res: any) => {
    const { id } = req.params;
    const userId = req.user.id;
 
    try {
        const friendRequest = await AppDataSource.getRepository(FriendRequests).findOneOrFail({
            where: { id }
        });
 
        if (friendRequest.receiverId !== userId) {
            return res.status(403).json({ error: "Csak a címzett utasíthatja el a barátkérést." });
        }
 
        await AppDataSource.getRepository(FriendRequests).remove(friendRequest);
 
        res.json({ message: "A barátkérés elutasítva és törölve lett!" });
    } catch (error) {
        res.status(404).json({ error: "A barátkérés nem található." });
    }
});


// Barátkérések lekérése
router.get("/friendrequests/:receiverId", tokencheck, async (req, res) => {
    const receiverId = req.params.receiverId;

    try {
        const friendRequests = await AppDataSource.getRepository(FriendRequests)
            .createQueryBuilder("friendRequest")
            .leftJoinAndSelect("friendRequest.sender", "sender")
            .leftJoinAndSelect("friendRequest.receiver", "receiver")
            .where("friendRequest.receiverId = :receiverId", { receiverId })
            .andWhere(new Brackets(qb => {
                qb.where("friendRequest.status = :pendingStatus", { pendingStatus: "pending" })
                  .orWhere("friendRequest.status = :acceptedStatus", { acceptedStatus: "accepted" })
            }))
            .getMany();

        res.json({ friendRequests });
    } catch (error) {
        console.error("Error fetching friend requests:", error);
        res.status(500).json({ error: "Hiba történt a barátkérések lekérése közben." });
    }
});


// Követők lekérése
router.get("/followers", tokencheck, async (req: any, res: any) => {
    const userId = req.user.id;

    try {
        const followers = await AppDataSource.getRepository(Follows).find({
            where: { followedUser: { id: userId } }, // A bejelentkezett felhasználó követői
            relations: ["followingUser"]
        });

        const followerNames = followers.map(follow => follow.followerUser.name); // Feltételezve, hogy a felhasználói entitásnak van 'name' mezője

        res.json({ followers: followerNames });

    } catch (error) {
        res.status(500).json({ error: "Hiba történt a követők lekérése közben." });
    }
});

// Követők számának lekérése
router.get("/followers/count", tokencheck, async (req: any, res: any) => {
    const userId = req.user.id;

    try {
        const followerCount = await AppDataSource.getRepository(Follows).count({
            where: { followedUser: { id: userId } } // A bejelentkezett felhasználó követőinek száma
        });

        res.json({ followerCount });
    } catch (error) {
        res.status(500).json({ error: "Hiba történt a követők számának lekérése közben." });
    }
});

// Barát törlése (follower eltávolítása)
router.delete("/followers/:followerId", tokencheck, async (req: any, res: any) => {
    const { followerId } = req.params;
    const userId = req.user.id;
    const invalidFields: string[] = [];

    // Érvényesítés: followerId mező ellenőrzése
    if (!followerId) {
        invalidFields.push("followerId");
    }

    if (invalidFields.length > 0) {
        return res.status(400).json({ error: "Kérjük, adja meg a követett felhasználó azonosítóját!", invalidFields });
    }

    try {
        const followRelation = await AppDataSource.getRepository(Follows).findOneOrFail({
            where: { followerUser: { id: followerId }, followedUser: { id: userId } }
        });

        await AppDataSource.getRepository(Follows).remove(followRelation);
        res.json({ message: "A követés sikeresen megszüntetve." });
    } catch (error) {
        res.status(404).json({ error: "A követés nem található vagy már törölve lett." });
    }
});

export default router;
