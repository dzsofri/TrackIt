import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { Tasks } from "./Task";

@Entity()
export class TaskStatuses {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Tasks, (task) => task.taskStatuses, { onDelete: "CASCADE" })
    @JoinColumn({ name: "taskId" })
    task: Tasks;

    @Column({ type: "varchar", length: 100 })
    priority: string;

    @Column({ type: "varchar", length: 40 })
    color: string;
}
