import { Entity, PrimaryColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, OneToMany } from "typeorm";
import { Users } from "./User";
import { TaskStatuses } from "./TaskStatus";
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

    @OneToMany(() => TaskStatuses, (taskStatus) => taskStatus.task)
    taskStatuses: TaskStatuses[];

    // Hozzáadjuk ezt a kapcsolatot a statisztikákhoz
    @OneToMany(() => UserStatistics, (statistics) => statistics.activeTask)
    statistics: UserStatistics[];  // Statikus statisztikák a feladathoz

    status: 'todo' | 'in-progress' | 'done'; // Itt is érdemes ezt a típusdefiníciót alkalmazni
}
