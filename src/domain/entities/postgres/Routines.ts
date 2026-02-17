import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  BaseEntity,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from "typeorm";
import { User } from "./User";
import { Period } from "@/domain/models/postgres/RoutinModel";
import { Notes } from "./Notes";

@Entity("routines")
export class Routines extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 100 })
  type!: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  period?: Period;

  @CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  created_at!: Date;

  @ManyToOne(() => User, (user) => user.routines, { nullable: false })
  @JoinColumn({ name: "user_id" })
  user!: User;

  @OneToMany(() => Notes, (note) => note.routine, {
    cascade: true,
  })
  notes!: Notes[];

  @UpdateDateColumn({
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP",
    onUpdate: "CURRENT_TIMESTAMP",
  })
  updated_at!: Date;
}
