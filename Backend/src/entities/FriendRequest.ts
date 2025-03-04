import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { Users } from "./User";


@Entity()
export class FriendRequests {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Users, (user) => user.sentFriendRequests)
    @JoinColumn({ name: "senderId" })
    sender: Users;

    @Column({ type: "varchar", length: 40 })
    senderId: string;

    @ManyToOne(() => Users, (user) => user.receivedFriendRequests)
    @JoinColumn({ name: "receiverId" })
    receiver: Users;

    @Column({ type: "varchar", length: 40 })
    receiverId: string;

    @Column({ type: "enum", enum: ["pending", "accepted"], default: "pending" })
    status: string;

    @CreateDateColumn()
    createdAt: Date;
}
