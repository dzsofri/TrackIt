import { AppDataSource } from "../data-source";
import { FeedbackQuestions } from "../entities/FeedbackQuestion";

// 🔹 Don't reinitialize AppDataSource in the seedDatabase!
async function seedDatabase() {
    try {
      const packageRepository = AppDataSource.getRepository(FeedbackQuestions);
  
      // A kérdések, amiket hozzá akarunk adni
      const questions = [
        { question: "Mennyire könnyen találtad meg a keresett funkciókat az oldalon?", isactive: true },
        { question: "Mennyire hasznosak a havi tervezési funkciók?", isactive: true },
        { question: "Mennyire könnyen tudod követni a kihívásokban elért előrehaladást?", isactive: true },
      ];

      for (const newQuestion of questions) {
        // Ellenőrizzük, hogy már létezik-e ugyanolyan kérdés az adatbázisban
        const existingQuestion = await packageRepository.findOne({ where: { question: newQuestion.question } });
        if (!existingQuestion) {
          // Ha nem létezik, hozzáadjuk
          await packageRepository.save(newQuestion);
          console.log(`✅ Question added: "${newQuestion.question}"`);
        } else {
          console.log(`⚠️ Question already exists: "${newQuestion.question}", skipping.`);
        }
      }

    } catch (error) {
      console.error("❌ Error occurred during seeding:", error);
    }
}

export { seedDatabase }
