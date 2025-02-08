import { Entity, Column, CreateDateColumn } from "typeorm";

@Entity()
export class Followes {
    @Column({ type: "varchar", length: 40, primary: true })
    followingUserId: string;

    @Column({ type: "varchar", length: 40, primary: true })
    followedUserId: string;

    @CreateDateColumn()
    createdAt: Date;
}
