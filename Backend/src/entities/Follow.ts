import { Entity, Column, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { Users } from "./User";


@Entity()
export class Followes {
    @ManyToOne(() => Users, (user) => user.following)
    @JoinColumn({ name: "followingUserId" })
    followingUser: Users;

    @Column({ type: "varchar", length: 40, primary: true })
    followingUserId: string;

    @ManyToOne(() => Users, (user) => user.followers)
    @JoinColumn({ name: "followedUserId" })
    followedUser: Users;

    @Column({ type: "varchar", length: 40, primary: true })
    followedUserId: string;

    @CreateDateColumn()
    createdAt: Date;
}
