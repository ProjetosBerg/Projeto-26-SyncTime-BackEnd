import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { User } from "./User";

@Entity("goals")
@Index("IDX_goals_user_end_date", ["user", "endDate"])
export class Goal extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 100 })
  title!: string;

  @Column({ type: "text", nullable: true })
  description?: string | null;

  @Column({ type: "integer" })
  targetCount!: number;

  @Column({ type: "date" })
  startDate!: string;

  @Column({ type: "date" })
  endDate!: string;

  @ManyToOne(() => User, (user) => user.goals, {
    nullable: false,
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "user_id" })
  user!: User;

  @CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  created_at!: Date;

  @UpdateDateColumn({
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP",
    onUpdate: "CURRENT_TIMESTAMP",
  })
  updated_at!: Date;
}
