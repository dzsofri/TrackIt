import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    CreateDateColumn
} from "typeorm";
import { Users } from "./User";

@Entity()
export class Events {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ type: "varchar", length: 255 })
    title: string;

    @Column({ type: "text", nullable: true })
    description: string;

    @Column({ type: "datetime" })
    startTime: Date;

    @Column({ type: "datetime" })
    endTime: Date;

    @CreateDateColumn({ type: "datetime" })
    createdAt: Date;

    @Column({ type: "varchar", length: 255 })
    color: string;

    @ManyToOne(() => Users, (user) => user.tasks)
    @JoinColumn({ name: "userId" }) // ez lesz a foreign key oszlop az Events táblában
    user: Users;
     
}
