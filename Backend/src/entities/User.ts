import { Entity, PrimaryColumn, Column, CreateDateColumn } from "typeorm";


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
    
    @Column({
        type: "enum",
        enum: UserRole,
        default: UserRole.USER, 
      })
      role: UserRole;

    @Column({ type: "varchar", length: 40, nullable: true })
    pictureId: string;

    @CreateDateColumn()
    createdAt: Date;
}
