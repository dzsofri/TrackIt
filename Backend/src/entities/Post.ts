import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { Pictures } from "./Picture";
import { Users } from "./User";


@Entity()
export class Posts {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: "varchar", length: 255 })
    title: string;

    @Column({ type: "text" })
    body: string;

    @ManyToOne(() => Users, (user) => user.posts)
    @JoinColumn({ name: "userId" })
    user: Users;

    @Column({ type: "varchar", length: 40, nullable: true })
    userId: string;

    @Column({ type: "varchar", length: 50, nullable: true })
    status: string;

    @CreateDateColumn()
    createdAt: Date;

    @ManyToOne(() => Pictures)
    @JoinColumn({ name: "pictureId" })
    picture: Pictures;

    @Column({ type: "varchar", length: 40 })
    pictureId: string;
}
