import { Entity, PrimaryColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { Users } from "./Users";

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
}
