import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";

@Entity()
export class UserStatistics {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: "varchar", length: 40, nullable: true })
    userId: string;

    @Column({ type: "int", default: 0 })
    completedTasks: number;

    @Column({ type: "int", default: 0 })
    missedTasks: number;

    @Column({ type: "float", default: 0 })
    completionRate: number;

    @CreateDateColumn()
    createdAt: Date;

    @Column({ type: "varchar", length: 40 })
    activeChallengeId: string;

    @Column({ type: "varchar", length: 40 })
    activeTaskId: string;
}
