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

@Entity("notifications")
export class Notification extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 255 })
  title!: string;

  @Column({ type: "varchar", length: 50 })
  entity!: string;

  @Column({ type: "boolean", default: false })
  isRead!: boolean;

  @Column({ type: "boolean", default: true })
  isNew!: boolean;

  @Column({ type: "varchar", nullable: true })
  path?: string;

  @Column({ type: "uuid", nullable: true })
  idEntity?: string;

  @Column("json", { nullable: true })
  payload?: Record<string, any>;

  @Column({ type: "varchar", nullable: true })
  typeOfAction?: string;

  @ManyToOne(() => User, (user) => user.notifications, { nullable: false })
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
