import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";

@Entity()
export class Posts {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: "varchar", length: 255 })
    title: string;

    @Column({ type: "text" })
    body: string;

    @Column({ type: "varchar", length: 40, nullable: true })
    userId: string;

    @Column({ type: "varchar", length: 50, nullable: true })
    status: string;

    @CreateDateColumn()
    createdAt: Date;

    @Column({ type: "varchar", length: 40 })
    pictureId: string;
}
