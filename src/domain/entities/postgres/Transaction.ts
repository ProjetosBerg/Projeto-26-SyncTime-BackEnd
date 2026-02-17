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
import { MonthlyRecord } from "./MonthlyRecord";
import { Category } from "./Category";
import { User } from "./User";

@Entity("transactions")
export class Transaction extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 100 })
  title!: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  description!: string;

  @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
  amount?: number;

  @Column({ type: "date" })
  transaction_date!: Date;

  @ManyToOne(() => MonthlyRecord, (record) => record.id, { nullable: false })
  @JoinColumn({ name: "monthly_record_id" })
  monthly_record!: MonthlyRecord;

  @ManyToOne(() => Category, (category) => category.id, { nullable: false })
  @JoinColumn({ name: "category_id" })
  category!: Category;

  @ManyToOne(() => User, (user) => user.id, { nullable: false })
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
