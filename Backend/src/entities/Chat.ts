import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from "typeorm";
import { Users } from "./User"; // Felhasználói entitás importálása

@Entity()
export class Chat {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => Users, { eager: true })
  sender: Users; // A feladó (felhasználó)

  @ManyToOne(() => Users, { eager: true })
  receiver: Users; // A címzett (felhasználó)

  @Column("text")
  message: string; // Az üzenet tartalma

  @CreateDateColumn()
  createdAt: Date; // Az üzenet küldésének időpontja

  @Column({ default: false })
  isRead: boolean; // Olvasott állapot
}
