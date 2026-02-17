import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  BaseEntity,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { User } from "./User";
import { Category } from "./Category";
import { Routines } from "./Routines";
import { Comment } from "@/domain/models/postgres/NotesModel";

@Entity("notes")
export class Notes extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 50, nullable: true })
  status?: string;

  @Column("simple-array", { nullable: true })
  collaborators?: string[];

  @Column({ type: "varchar", length: 50, nullable: true })
  priority?: string;

  @ManyToOne(() => Category, (category) => category.notes, {
    nullable: true,
  })
  @JoinColumn({ name: "category_id" })
  category?: Category;

  @Column({ type: "varchar", length: 255, nullable: true })
  activity?: string;

  @Column({ type: "varchar", length: 100, nullable: true })
  activityType?: string;

  @Column("text", { nullable: true })
  description?: string;

  @Column({ type: "time", nullable: true })
  startTime?: string;

  @Column({ type: "time", nullable: true })
  endTime?: string;

  @Column({ type: "timestamp", nullable: true })
  dateOfNote?: Date;

  @Column("json", { nullable: true })
  comments?: Comment[];

  @ManyToOne(() => Routines, (routine) => routine.notes, { nullable: false })
  @JoinColumn({ name: "routine_id" })
  routine!: Routines;

  @ManyToOne(() => User, (user) => user.notes, { nullable: false })
  @JoinColumn({ name: "user_id" })
  user!: User;

  @Column("text", { nullable: true })
  summaryDay?: string;

  @CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  created_at!: Date;

  @UpdateDateColumn({
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP",
    onUpdate: "CURRENT_TIMESTAMP",
  })
  updated_at!: Date;
}
