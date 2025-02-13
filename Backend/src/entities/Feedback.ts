import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { FeedbackQuestions } from "./FeedbackQuestion";
import { Users } from "./User";

@Entity()
export class Feedbacks {
    @PrimaryGeneratedColumn()
    id: number;

     @ManyToOne(() => Users, (user) => user.feedbacks)
           @JoinColumn({ name: "userId" })
           user: Users;
           

    @ManyToOne(() => FeedbackQuestions)
    @JoinColumn({ name: "questionId" })
    question: FeedbackQuestions;

    @Column({ type: "int" })
    rating: number;
}
 