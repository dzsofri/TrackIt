import { Router } from "express";
import { AppDataSource } from "../data-source";
import { Feedbacks } from "../entities/Feedback";
import { FeedbackQuestions } from "../entities/FeedbackQuestion";
import { Users } from "../entities/User";
import { isAdmin } from "../utiles/adminUtils";
import { tokencheck } from "../utiles/tokenUtils";
const router = Router();

// Minden visszajelzés lekérése
router.get('/', tokencheck, isAdmin, async (req: any, res: any) => {
    try {
        const feedbacks = await AppDataSource.getRepository(Feedbacks).find({
            relations: ['question']
        });
        res.json({ feedbacks, message: 'A visszajelzések lekérése sikeres.' });
    } catch (error) {
        res.status(500).json({ error: 'Hiba történt a visszajelzések lekérése közben.' });
    }
});


// Egy adott visszajelzés lekérése **kérdés ID alapján**
router.get('/question/:questionId', tokencheck, isAdmin, async (req: any, res: any) => {
    const { questionId } = req.params;
    try {
        const feedbacks = await AppDataSource.getRepository(Feedbacks).find({
            where: { question: { id: questionId } },
            relations: ['user']
        });

        if (!feedbacks.length) {
            return res.status(404).json({ error: 'Nincsenek visszajelzések erre a kérdésre.' });
        }
        res.json({ feedbacks, message: 'A visszajelzések sikeresen lekérdezve.' });
    } catch (error) {
        res.status(500).json({ error: 'Hiba történt a visszajelzések lekérése közben.' });
    }
});

// **Átlagos értékelés lekérése minden visszajelzésből**
router.get('/average-rating', tokencheck, isAdmin, async (req: any, res: any) => {
    try {
        const feedbacks = await AppDataSource.getRepository(Feedbacks).find();
        const totalRating = feedbacks.reduce((acc, feedback) => acc + feedback.rating, 0);
        const averageRating = feedbacks.length ? (totalRating / feedbacks.length).toFixed(2) : 0;

        res.json({ averageRating, message: 'Az átlagos értékelés sikeresen lekérdezve.' });
    } catch (error) {
        res.status(500).json({ error: 'Hiba történt az átlagos értékelés lekérése közben.' });
    }
});

// **Átlagos értékelés lekérése kérdésenként**
router.get('/average-rating/per-question', tokencheck, isAdmin, async (req: any, res: any) => {
    try {
        const questions = await AppDataSource.getRepository(FeedbackQuestions).find();
        const averageRatings = [];

        for (const question of questions) {
            const feedbacks = await AppDataSource.getRepository(Feedbacks).find({
                where: { question: { id: question.id } }
            });

            const totalRating = feedbacks.reduce((acc, feedback) => acc + feedback.rating, 0);
            const averageRating = feedbacks.length ? (totalRating / feedbacks.length).toFixed(2) : 0;

            averageRatings.push({
                questionId: question.id,
                questionText: question.question, 
                averageRating: averageRating
            });
        }

        res.json({ averageRatings, message: 'A kérdésenkénti átlagos értékelések sikeresen lekérdezve.' });
    } catch (error) {
        res.status(500).json({ error: 'Hiba történt a kérdésenkénti átlagos értékelések lekérése közben.' });
    }
});

// Átlagos értékelés lekérése adott kérdés ID alapján
router.get('/average-rating/question/:questionId', tokencheck, isAdmin, async (req: any, res: any) => {
    const { questionId } = req.params;
    try {
        const feedbacks = await AppDataSource.getRepository(Feedbacks).find({
            where: { question: { id: questionId } }
        });

        if (!feedbacks.length) {
            return res.status(404).json({ error: 'Nincsenek visszajelzések erre a kérdésre.' });
        }

        const totalRating = feedbacks.reduce((acc, feedback) => acc + feedback.rating, 0);
        const averageRating = (totalRating / feedbacks.length).toFixed(2);

        res.json({ questionId, averageRating, message: 'A kérdés átlagos értékelése sikeresen lekérdezve.' });
    } catch (error) {
        res.status(500).json({ error: 'Hiba történt az átlagos értékelés lekérése közben.' });
    }
});


// **Egy adott visszajelzés lekérése FELHASZNÁLÓ ID alapján**
router.get('/user/:userId', tokencheck, isAdmin, async (req: any, res: any) => {
    const { userId } = req.params;
    try {
        const feedbacks = await AppDataSource.getRepository(Feedbacks).find({
            where: { user: { id: userId } },
            relations: ['question']
        });

        if (!feedbacks.length) {
            return res.status(404).json({ error: 'Nincsenek visszajelzések erre a felhasználóra.' });
        }
        res.json({ feedbacks, message: 'A visszajelzések sikeresen lekérdezve.' });
    } catch (error) {
        res.status(500).json({ error: 'Hiba történt a visszajelzések lekérése közben.' });
    }
});

// **Visszajelzés létrehozása**
router.post('/', tokencheck, async (req: any, res: any) => {
    const { questionId, rating } = req.body;
    const invalidFields: string[] = []; 
    const userId = req.user.id; 

    if (!userId) invalidFields.push('userId');
    if (!questionId) invalidFields.push('questionId');
    if (typeof rating !== 'number' || rating < 1 || rating > 5) invalidFields.push('rating');

    if (invalidFields.length > 0) {
        return res.status(400).json({
            message: "A megadott mezők érvénytelenek vagy üresek!",
            invalid: invalidFields
        });
    }

    try {
        const feedback = new Feedbacks();
        feedback.user = await AppDataSource.getRepository(Users).findOneByOrFail({ id: userId });
        feedback.question = await AppDataSource.getRepository(FeedbackQuestions).findOneByOrFail({ id: questionId });
        feedback.rating = rating;

        await AppDataSource.getRepository(Feedbacks).save(feedback);
        res.status(201).json({ feedback, message: 'A visszajelzés sikeresen létrehozva.' });
    } catch (error) {
        res.status(500).json({ error: 'Hiba történt a visszajelzés létrehozása közben.' });
    }
});

export default router;
