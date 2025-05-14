import { 
    Entity, 
    PrimaryGeneratedColumn, 
    Column, 
    CreateDateColumn, 
    ManyToOne, 
    JoinColumn, 
    Index, 
    OneToMany
} from "typeorm";
import { Users } from "./User";  // Felhasználói entitás
import { Posts } from "./Post";  // Poszt entitás

@Entity()
@Index("idx_comment_user_post", ["userId", "postId"])  // Index a gyors kereséshez
export class Comments {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ type: "text" })
    text: string;

    @CreateDateColumn()
    createdAt: Date;

    @ManyToOne(() => Users, (user) => user.comments, { eager: true })
    @JoinColumn({ name: "userId" })
    user: Users;

    @Column({ type: "varchar", length: 40 })
    userId: string;  // A felhasználó ID-ja, aki írta a kommentet

   @ManyToOne(() => Posts, (post) => post.comments, { eager: true, onDelete: "CASCADE" })
@JoinColumn({ name: "postId" })
post: Posts;


    @Column({ type: "varchar", length: 40 })
    postId: string;  // A poszt ID-ja, amelyhez a komment tartozik

    @ManyToOne(() => Comments, (comment) => comment.children, { nullable: true, onDelete: "CASCADE" })
    @JoinColumn({ name: "parentId" })
    parent: Comments | null;  // A szülő komment (ha van)

    @Column({ type: "varchar", length: 40, nullable: true })
    parentId: string | null;  // A szülő komment ID-ja (ha van)

    @OneToMany(() => Comments, (comment) => comment.parent)
    children: Comments[]; // <-- helyes típus
}
