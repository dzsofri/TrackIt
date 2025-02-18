import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, JoinColumn, ManyToOne } from "typeorm";
import { Habits } from "./Habit";

@Entity()
export class HabitTrackings {
    @PrimaryGeneratedColumn() // EZ AZ AUTOMATIKUS ID GENERÁLÁS
    id: number;

    @ManyToOne(() => Habits, (habit) => habit.habitTrackings, { onDelete: "SET NULL" })
    @JoinColumn({ name: "habitId" })
    habit: Habits;

    @CreateDateColumn()
    date: Date;

    @Column({ type: "boolean", nullable: true })
    achieved: boolean;

    @Column({ type: "varchar", length: 50, nullable: true })
    value: string;
}
