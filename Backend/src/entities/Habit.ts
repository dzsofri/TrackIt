import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { Users } from "./User";
import { HabitTrackings } from "./HabitTracking";

@Entity()
export class Habits {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Users, (user) => user.habits)
    @JoinColumn({ name: "userId" })
    user: Users;

    @Column({ type: "varchar", length: 255 })
    habitName: string;

    @Column({ type: "varchar", length: 50, nullable: true })
    targetValue: string;

    @Column({ type: "varchar", length: 50, nullable: true })
    currentValue: string;

    @Column({ type: "varchar", length: 50, nullable: true })
    frequency: string;

    @Column({ type: "varchar", length: 20, default: 'inactive' })
    status: string; // <<< ÚJ MEZŐ

    @CreateDateColumn()
    createdAt: Date;


    @OneToMany(() => HabitTrackings, (habitTrack) => habitTrack.habit)
    habitTrackings: HabitTrackings[];
}
