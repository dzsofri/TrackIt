import { Entity, PrimaryColumn, Column } from "typeorm";

@Entity()
export class Badges {
    @PrimaryColumn({ type: "varchar", length: 40 })
    id: string;

    @Column({ type: "varchar", length: 255 })
    filename: string;

    @Column({ type: "varchar", length: 255 })
    path: string;
}