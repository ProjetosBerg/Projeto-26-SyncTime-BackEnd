import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  BaseEntity,
  ManyToOne,
  JoinColumn,
  Unique,
} from "typeorm";
import { User } from "./User";

@Entity("user_monthly_entry_rank")
@Unique(["userId", "year", "month"])
export class UserMonthlyEntryRank extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "uuid" })
  userId!: string;

  @ManyToOne(() => User, (user) => user.monthlyEntryRanks, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "userId" })
  user!: User;

  @Column({ type: "int" })
  year!: number;

  @Column({ type: "int" })
  month!: number;

  @Column({ type: "int", default: 0 })
  totalEntries!: number;

  @Column({ type: "timestamp", nullable: true })
  lastPositionLossNotifiedAt!: Date | null;

  @Column({ type: "int", nullable: true })
  lastNotifiedRank!: number | null;

  @CreateDateColumn({ type: "timestamp" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updatedAt!: Date;
}
