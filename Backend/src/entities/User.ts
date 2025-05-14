import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany, Index, ManyToOne, JoinColumn } from "typeorm";
import { Follows } from "./Follow";
import { FriendRequests } from "./FriendRequest";
import { Pictures } from "./Picture";
import { Posts } from "./Post";
import { Tasks } from "./Task";
import { UserChallenges } from "./UserChallenge";
import { UserStatistics } from "./UserStatistic";
import { Feedbacks } from "./Feedback";
import { Habits } from "./Habit";
import { Chat } from "./Chat";
import { Events } from "./Event";


export enum UserRole {
    ADMIN = "admin",
    USER = "user"
}

 


export enum UserStatus {
    ONLINE = "online",
    OFFLINE = "offline"
}

@Entity()
export class Users {
    @PrimaryGeneratedColumn("uuid")
    id: string;
 
    @Column({ type: "varchar", length: 255 })
    name: string;
 
    @Column({ type: "varchar", length: 255, unique: true })
    email: string;
 
    @Column({ type: "varchar", length: 255 })
    password: string;
 
    @Column({ type: "enum", enum: UserRole, default: UserRole.USER })
    role: UserRole;
 
    @Column({ type: "varchar", length: 255, nullable: true })
    pictureId: string;
 
    @CreateDateColumn()
    createdAt: Date;
 
    @Column({ type: "timestamp", nullable: true })
    reminderAt: Date;
 
    @Column({ type: "varchar", nullable: true, default: null })
    resetPasswordToken: string | null;
 
    @Column({ type: "timestamp", nullable: true, default: null })
    resetPasswordExpires: Date | null;


    @Column({ type: "enum", enum: UserStatus, default: UserStatus.OFFLINE })
    status: UserStatus;  // New status column to track whether user is online or offline


    @OneToMany(() => FriendRequests, (friendRequest) => friendRequest.sender, { onDelete: "CASCADE" })
    sentFriendRequests: FriendRequests[];
 
    @OneToMany(() => FriendRequests, (friendRequest) => friendRequest.receiver, { onDelete: "CASCADE" })
    receivedFriendRequests: FriendRequests[];
 
    @OneToMany(() => Follows, (follow) => follow.followerUser, { onDelete: "CASCADE" })
    following: Follows[];
 
    @OneToMany(() => Follows, (follow) => follow.followedUser, { onDelete: "CASCADE" })
    followers: Follows[];
 
    @OneToMany(() => Posts, (post) => post.user, { onDelete: "CASCADE" })
    posts: Posts[];
 
    @OneToMany(() => Tasks, (task) => task.user, { onDelete: "CASCADE" })
    tasks: Tasks[];
 
    @OneToMany(() => UserChallenges, (challenge) => challenge.user, { onDelete: "CASCADE" })
    challenges: UserChallenges[];
 
    @OneToMany(() => UserStatistics, (statistic) => statistic.user, { onDelete: "CASCADE" })
    statistics: UserStatistics[];
 
    @OneToMany(() => Habits, (habit) => habit.user, { onDelete: "CASCADE" })
    habits: Habits[];
 
    @OneToMany(() => Feedbacks, (feedback) => feedback.user, { onDelete: "CASCADE" })
    feedbacks: Feedbacks[];

    @OneToMany(() => Chat, (chat) => chat.sender, { onDelete: "CASCADE" })
    sentMessages: Chat[]; // A felhasználó által küldött üzenetek

    @OneToMany(() => Chat, (chat) => chat.receiver, { onDelete: "CASCADE" })
    receivedMessages: Chat[]; // A felhasználó által fogadott üzenetek


    @OneToMany(() => Events, (event) => event.user, { onDelete: "CASCADE" })
    events: Events[];

    @ManyToOne(() => Pictures, { nullable: true })
    @JoinColumn({ name: "pictureId" })
    picture: Pictures;

}

