import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { FeedbackQuestions } from "./FeedbackQuestion";

@Entity()
export class Feedbacks {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: "varchar", length: 40 })
    userId: string;

    @ManyToOne(() => FeedbackQuestions)
    @JoinColumn({ name: "questionId" })
    question: FeedbackQuestions;

    @Column({ type: "int" })
    rating: number;
}
 