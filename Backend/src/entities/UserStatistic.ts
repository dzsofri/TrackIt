import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, JoinColumn, ManyToOne } from "typeorm";
import { Users } from "./User";
import { UserChallenges } from "./UserChallenge";
import { Tasks } from "./Task";

@Entity()
export class UserStatistics {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Users, (user) => user.statistics)
    @JoinColumn({ name: "userId" })
    user: Users;

    @Column({ type: "int", default: 0 })
    completedTasks: number;

    @Column({ type: "int", default: 0 })
    missedTasks: number;

    @Column({ type: "float", default: 0 })
    completionRate: number;

    @CreateDateColumn()
    createdAt: Date;

    @ManyToOne(() => UserChallenges, (challenge) => challenge.statistics, { nullable: true })
    @JoinColumn({ name: "activeChallengeId" })
    activeChallenge: UserChallenges;

    @ManyToOne(() => Tasks, (task) => task.statistics, { nullable: true, onDelete: "CASCADE" })
    @JoinColumn({ name: "activeTaskId" })
    activeTask: Tasks;
}
