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
import { Category } from "./Category";
import { User } from "./User";
import { Transaction } from "./Transaction";
// TODO: adicionar status
@Entity("monthly_records")
export class MonthlyRecord extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 100 })
  title!: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  description!: string;

  @Column({ type: "varchar", length: 255 })
  goal!: string;

  @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
  initial_balance!: number;

  @Column({ type: "integer" })
  month!: number;

  @Column({ type: "integer" })
  year!: number;

  @Column({ type: "varchar", length: 255 })
  status!: string;

  @ManyToOne(() => Category, (category) => category.id, { nullable: false })
  @JoinColumn({ name: "category_id" })
  category!: Category;

  @ManyToOne(() => User, (user) => user.id, { nullable: false })
  @JoinColumn({ name: "user_id" })
  user!: User;

  @OneToMany(() => Transaction, (transaction) => transaction.monthly_record, {
    cascade: true,
  })
  transactions!: Transaction[];

  @CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  created_at!: Date;

  @UpdateDateColumn({
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP",
    onUpdate: "CURRENT_TIMESTAMP",
  })
  updated_at!: Date;
}
