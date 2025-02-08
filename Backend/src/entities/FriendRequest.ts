import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";

@Entity()
export class FriendRequests {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: "varchar", length: 40 })
    senderId: string;

    @Column({ type: "varchar", length: 40 })
    receiverId: string;

    @Column({ type: "enum", enum: ["pending", "accepted", "rejected"], default: "pending" })
    status: string;

    @CreateDateColumn()
    createdAt: Date;
}
