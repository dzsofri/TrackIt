import { Entity, PrimaryColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, OneToMany } from "typeorm";
import { Users } from "./User";
import { UserStatistics } from "./UserStatistic";
import { Badges } from "./Badges";

@Entity()
export class UserChallenges {
    @PrimaryColumn({ type: "varchar", length: 40 })
    id: string;

    @Column({ type: "varchar", length: 40 })
    secondaryId: string;

    @ManyToOne(() => Users, (user) => user.challenges)
    @JoinColumn({ name: "userId" })
    user: Users;

    @Column({ type: "varchar", length: 40 })
    userId: string;

    @Column({ type: "varchar", length: 255 })
    challengeName: string;

    @Column({ type: "text" })
    challengeDescription: string;

    @Column({ type: "float", default: 0 }) // Alapértelmezett érték 0
    progressPercentage: number;

    @CreateDateColumn()
    createdAt: Date;

    @Column({ type: "date", nullable: true }) // Engedélyezett a null
    completedAt: Date | null;

    @Column({ type: "tinyint", default: 0 }) // Alapértelmezett érték 0
    status: number;

    @Column({ type: "int" })
    durationDays: number;

    @Column({ type: "int" })
    rewardPoints: number;

    @Column({ type: "timestamp", nullable: true }) // Engedélyezett a null
    finalDate: Date | null;

    @Column({ type: "varchar", length: 255, nullable: true }) // Engedélyezett a null
    badgeId: string | null;

    @ManyToOne(() => Badges, { nullable: true })
    @JoinColumn({ name: "badgeId" })
    picture: Badges | null;
}