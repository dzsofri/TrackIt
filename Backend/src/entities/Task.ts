import { Entity, PrimaryColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, OneToMany } from "typeorm";
import { Users } from "./User";
import { UserStatistics } from "./UserStatistic";

@Entity()
export class Tasks {
    @PrimaryColumn({ type: "varchar", length: 40 })
    id: string;

    @Column({ type: "varchar", length: 255 })
    title: string;

    @Column({ type: "text", nullable: true })
    description: string;

    @Column({ type: "varchar", length: 50, nullable: true })
    priority: string;

    @Column({ type: "date", nullable: true })
    dueDate: Date;

    @ManyToOne(() => Users, (user) => user.tasks)
    @JoinColumn({ name: "userId" })
    user: Users;

    @Column({ type: "varchar", length: 40, nullable: true })
    userId: string;

    @CreateDateColumn()
    createdAt: Date;    

    @OneToMany(() => UserStatistics, (statistics) => statistics.activeTask)
    statistics: UserStatistics[];

    // **Hozzáadjuk a status mezőt**
    @Column({
        type: "enum",
        enum: ['todo', 'in-progress', 'done'],
        default: 'todo', // Alapértelmezett státusz
    })
    status: 'todo' | 'in-progress' | 'done';
}
