import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  BaseEntity,
  OneToMany,
} from "typeorm";
import { v4 as uuidv4 } from "uuid";
import { SecurityQuestion } from "./SecurityQuestion";
import { Category } from "./Category";
import { MonthlyRecord } from "./MonthlyRecord";
import { Transaction } from "./Transaction";
import { Routines } from "./Routines";
import { Notes } from "./Notes";
import { Authentication } from "./Authentication";
import { Notification } from "./Notification";
import { UserMonthlyEntryRank } from "./UserMonthlyEntryRank";

@Entity("users")
export class User extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string = uuidv4();

  @Column({ name: "name" })
  name!: string;

  @Column({ type: "varchar", length: 100, unique: true })
  login!: string;

  @Column({ type: "varchar", length: 100, unique: true })
  email!: string;

  @Column({ type: "varchar", length: 255 })
  password!: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  bio?: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  imageUrl?: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  publicId?: string;

  @OneToMany(() => SecurityQuestion, (question) => question?.user, {
    cascade: true,
  })
  security_questions!: SecurityQuestion[];

  @OneToMany(() => Category, (category) => category.user, { cascade: true })
  categories!: Category[];

  @OneToMany(() => Routines, (routine) => routine.user, { cascade: true })
  routines!: Routines[];

  @OneToMany(() => MonthlyRecord, (record) => record.user, { cascade: true })
  monthly_records!: MonthlyRecord[];

  @OneToMany(() => Transaction, (transaction) => transaction.user, {
    cascade: true,
  })
  transactions!: Transaction[];

  @OneToMany(() => Notes, (note) => note.user, {
    cascade: true,
  })
  notes!: Notes[];

  @OneToMany(() => Authentication, (auth) => auth.user, { cascade: true })
  authentications!: Authentication[];

  @OneToMany(() => Notification, (notification) => notification.user, {
    cascade: true,
  })
  notifications!: Notification[];

  @OneToMany(() => UserMonthlyEntryRank, (rank) => rank.user, { cascade: true })
  monthlyEntryRanks!: UserMonthlyEntryRank[];

  @CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  created_at!: Date;

  @UpdateDateColumn({
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP",
    onUpdate: "CURRENT_TIMESTAMP",
  })
  updated_at!: Date;
}
