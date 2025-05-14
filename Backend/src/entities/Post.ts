import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, OneToMany } from "typeorm";
import { Pictures } from "./Picture";
import { Users } from "./User";
import { Comments } from "./Comment";  // Komment entitás importálása

export enum PostStatus {
    PUBLISHED = "published",
    ARCHIVED = "archived"
}

@Entity()
export class Posts {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ type: "varchar", length: 255 })
    title: string;

    @Column({ type: "text" })
    body: string;

    @ManyToOne(() => Users, (user) => user.posts, { eager: true })
    @JoinColumn({ name: "userId" })
    user: Users;

    @Column({ type: "varchar", length: 40, nullable: true })
    userId: string;

    @Column({
        type: "enum",
        enum: PostStatus,
        default: PostStatus.PUBLISHED
    })
    status: PostStatus;

    @CreateDateColumn()
    createdAt: Date;

    @ManyToOne(() => Pictures, { nullable: true })
    @JoinColumn({ name: "pictureId" })
    picture: Pictures;

    @Column({ type: "varchar", length: 40, nullable: true })
    pictureId: string;

@OneToMany(() => Comments, (comment) => comment.post)
comments: Comments[];  // A `Comments` entitás nevét kell használni, nem `Comment`

}
