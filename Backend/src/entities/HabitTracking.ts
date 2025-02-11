import { Entity, Column, PrimaryColumn, CreateDateColumn } from "typeorm";

@Entity()
export class HabitTrackings {
    @PrimaryColumn()
    habitId: number;

    @CreateDateColumn()
    date: Date;

    @Column({ type: "boolean", nullable: true })
    achieved: boolean;

    @Column({ type: "varchar", length: 50, nullable: true })
    value: string;
}
