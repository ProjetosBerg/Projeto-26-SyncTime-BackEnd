import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  BaseEntity,
} from "typeorm";
import { User } from "./User";

@Entity("security_questions")
export class SecurityQuestion extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 255 })
  question!: string;

  @Column({ type: "varchar", length: 255 })
  answer!: string;

  @ManyToOne(() => User, (user) => user?.security_questions, {
    onDelete: "CASCADE",
  })
  user!: User;
}
