import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  BaseEntity,
  ManyToOne,
  JoinColumn,
  Index,
} from "typeorm";
import { User } from "./User";
import { Category } from "./Category";
import { Routines } from "./Routines";
import { Comment } from "@/domain/models/postgres/NotesModel";
import { RecurrenceFrequency } from "@/domain/models/postgres/NotesModel";

@Entity("notes")
@Index("IDX_notes_user_date_time", ["user", "dateOfNote", "startTime"])
@Index("IDX_notes_recurrence_group_date", ["recurrenceGroupId", "dateOfNote"], {
  unique: true,
  where: '"recurrenceGroupId" IS NOT NULL',
})
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
    onDelete: "CASCADE",
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

  @Column({ type: "uuid", nullable: true })
  recurrenceGroupId?: string;

  @Column({ type: "varchar", length: 20, nullable: true })
  recurrenceFrequency?: RecurrenceFrequency;

  @Column({ type: "integer", nullable: true })
  recurrenceInterval?: number;

  @Column({ type: "date", nullable: true })
  recurrenceEndDate?: string;

  @Column({ type: "json", nullable: true })
  recurrenceWeekDays?: number[];

  @Column("json", { nullable: true })
  comments?: Comment[];

  @ManyToOne(() => Routines, (routine) => routine.notes, {
    nullable: false,
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "routine_id" })
  routine!: Routines;

  @ManyToOne(() => User, (user) => user.notes, {
    nullable: false,
    onDelete: "CASCADE",
  })
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
