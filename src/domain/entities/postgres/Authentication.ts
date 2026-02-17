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
import { v4 as uuidv4 } from "uuid";
import { User } from "./User";

@Entity("authentication")
export class Authentication extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "uuid" })
  sessionId: string = uuidv4();

  @Column({ type: "uuid" })
  userId!: string;

  @ManyToOne(() => User, (user) => user.authentications, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "userId" })
  user!: User;

  @Column({ type: "timestamp", nullable: false })
  loginAt!: Date;

  @Column({ type: "timestamp", nullable: true })
  logoutAt!: Date | null;

  @Column({ default: false })
  isOffensive!: boolean;

  @Column({ type: "int", default: 1 })
  entryCount!: number;

  @Column({ type: "timestamp", nullable: false })
  lastEntryAt!: Date;

  @CreateDateColumn({ type: "timestamp" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updatedAt!: Date;

  setIsOffensive(): void {
    const hour = this.loginAt.getHours();
    this.isOffensive = hour < 12;
  }

  getSessionDuration(): number | null {
    if (!this.logoutAt) return null;
    const diffInMs = this.logoutAt.getTime() - this.loginAt.getTime();
    return Math.round(diffInMs / (1000 * 60));
  }
}
