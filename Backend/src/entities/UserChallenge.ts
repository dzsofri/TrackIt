import { Entity, PrimaryColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { Users } from "./Users";

@Entity()
export class UserChallenges {
    @PrimaryColumn({ type: "varchar", length: 40 })
    id: string;

    @ManyToOne(() => Users, (user) => user.challenges)
    @JoinColumn({ name: "userId" })
    user: Users;

    @Column({ type: "varchar", length: 40 })
    userId: string;

    @Column({ type: "float", default: 0 })
    progressPercentage: number;

    @CreateDateColumn()
    createdAt: Date;

    @Column({ type: "date", nullable: true })
    completedAt: Date;

    @Column({ type: "tinyint" })
    status: number;

    @Column({ type: "int" })
    durationDays: number;

    @Column({ type: "int" })
    rewardPoints: number;

    @Column({ type: "timestamp", nullable: true })
    finalDate: Date;
}
