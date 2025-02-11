import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class TaskStatuses {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: "varchar", length: 40 })
    taskId: string;

    @Column({ type: "varchar", length: 100 })
    priority: string;

    @Column({ type: "varchar", length: 40 })
    color: string;
}
