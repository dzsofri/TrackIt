import { Entity, PrimaryColumn, Column, CreateDateColumn, OneToMany, OneToOne, JoinColumn } from "typeorm";
import { Followes } from "./Follow";
import { FriendRequests } from "./FriendRequest";
import { Habits } from "./Habit";
import { Pictures } from "./Picture";
import { Posts } from "./Post";
import { Tasks } from "./Task";
import { UserChallenges } from "./UserChallenge";


export enum UserRole {
    ADMIN = "admin",
    USER = "user"
}

@Entity()
export class Users {
    @PrimaryColumn({ type: "varchar", length: 40 })
    id: string;

    @Column({ type: "varchar", length: 255 })
    name: string;

    @Column({ type: "varchar", length: 255, unique: true })
    email: string;

    @Column({ type: "varchar", length: 255 })
    password: string;
    
    @Column({ type: "enum", enum: UserRole, default: UserRole.USER })
    role: UserRole;

    @OneToOne(() => Pictures)
    @JoinColumn({ name: "pictureId" })
    picture: Pictures;

    @Column({ type: "varchar", length: 40, nullable: true })
    pictureId: string;

    @CreateDateColumn()
    createdAt: Date;

    @OneToMany(() => FriendRequests, (friendRequest) => friendRequest.sender)
    sentFriendRequests: FriendRequests[];

    @OneToMany(() => FriendRequests, (friendRequest) => friendRequest.receiver)
    receivedFriendRequests: FriendRequests[];

    @OneToMany(() => Followes, (follow) => follow.followingUser)
    following: Followes[];

    @OneToMany(() => Followes, (follow) => follow.followedUser)
    followers: Followes[];

    @OneToMany(() => Posts, (post) => post.user)
    posts: Posts[];

    @OneToMany(() => Tasks, (task) => task.user)
    tasks: Tasks[];

    @OneToMany(() => UserChallenges, (challenge) => challenge.user)
    challenges: UserChallenges[];

    @OneToMany(() => Habits, (habit) => habit.user)
    habits: Habits[];
}
