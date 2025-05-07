import { Entity, PrimaryColumn, Column, OneToMany } from "typeorm";
import { UserChallenges } from "./UserChallenge";

@Entity()
export class Badges {
    @PrimaryColumn({ type: "varchar", length: 40 })
    id: string;

    @Column({ type: "varchar", length: 255 })
    filename: string;

    @Column({ type: "varchar", length: 255 })
    path: string;

    @OneToMany(() => UserChallenges, (challenge) => challenge.picture)
    userChallenges: UserChallenges[];
}