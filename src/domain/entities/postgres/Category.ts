import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  BaseEntity,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from "typeorm";
import { RecordTypes } from "./RecordTypes";
import { User } from "./User";
import { MonthlyRecord } from "./MonthlyRecord";
import { Transaction } from "./Transaction";
import { Notes } from "./Notes";

@Entity("categories")
export class Category extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 100 })
  name!: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  description!: string;

  @Column({ type: "varchar", length: 50 })
  type!: string;

  @ManyToOne(() => RecordTypes, (recordType) => recordType.id, {
    nullable: false,
  })
  @JoinColumn({ name: "record_type_id" })
  record_type!: RecordTypes;

  @ManyToOne(() => User, (user) => user.id, { nullable: false })
  @JoinColumn({ name: "user_id" })
  user!: User;

  @OneToMany(() => MonthlyRecord, (record) => record.category, {
    cascade: true,
  })
  monthly_records!: MonthlyRecord[];

  @OneToMany(() => Transaction, (transaction) => transaction.category, {
    cascade: true,
  })
  transactions!: Transaction[];

  @OneToMany(() => Notes, (note) => note.category, {
    cascade: true,
  })
  notes!: Notes[];

  @CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  created_at!: Date;

  @UpdateDateColumn({
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP",
    onUpdate: "CURRENT_TIMESTAMP",
  })
  updated_at!: Date;
}
