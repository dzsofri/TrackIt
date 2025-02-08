import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";

@Entity()
export class Habits {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: "varchar", length: 40, nullable: true })
    userId: string;

    @Column({ type: "varchar", length: 255 })
    habitName: string;

    @Column({ type: "varchar", length: 50, nullable: true })
    targetValue: string;

    @Column({ type: "varchar", length: 50, nullable: true })
    currentValue: string;

    @Column({ type: "varchar", length: 50, nullable: true })
    frequency: string;

    @CreateDateColumn()
    createdAt: Date;
}
