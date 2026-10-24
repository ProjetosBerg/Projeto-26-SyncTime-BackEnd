import { Repository, getRepository } from "typeorm";
import { Goal } from "@/domain/entities/postgres/Goal";
import { Notes } from "@/domain/entities/postgres/Notes";
import { User } from "@/domain/entities/postgres/User";
import { GoalModel, GoalStatus } from "@/domain/models/postgres/GoalModel";
import { GoalRepositoryProtocol } from "../interfaces/goalRepositoryProtocol";

const toModel = (goal: Goal, userId: string): GoalModel => ({
  id: goal.id,
  title: goal.title,
  description: goal.description,
  targetCount: goal.targetCount,
  startDate: goal.startDate,
  endDate: goal.endDate,
  user_id: userId,
  created_at: goal.created_at,
  updated_at: goal.updated_at,
});

const enrichGoal = (goal: GoalModel, progress = 0): GoalModel => {
  const target = Math.max(goal.targetCount, 1);
  const todayParts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const part = (type: string) =>
    todayParts.find((item) => item.type === type)?.value || "";
  const today = `${part("year")}-${part("month")}-${part("day")}`;
  const status: GoalStatus =
    progress >= target ? "completed" : today > goal.endDate ? "expired" : "active";

  return {
    ...goal,
    progress,
    percentage: Math.min(100, Math.round((progress / target) * 100)),
    status,
  };
};

export class GoalRepository implements GoalRepositoryProtocol {
  private readonly repository: Repository<Goal>;

  constructor() {
    this.repository = getRepository(Goal);
  }

  async create(data: GoalRepositoryProtocol.CreateParams): Promise<GoalModel> {
    const saved = await this.repository.save(
      this.repository.create({
        title: data.title,
        description: data.description,
        targetCount: data.targetCount,
        startDate: data.startDate,
        endDate: data.endDate,
        user: { id: data.userId } as User,
      })
    );
    return enrichGoal(toModel(saved, data.userId), 0);
  }

  async findByUserId(userId: string): Promise<GoalModel[]> {
    const rows = await this.repository
      .createQueryBuilder("goal")
      .leftJoin(
        Notes,
        "note",
        `note."user_id" = goal."user_id" AND note.status = :completed AND DATE(note."dateOfNote") BETWEEN goal."startDate" AND goal."endDate"`,
        { completed: "Concluído" }
      )
      .where(`goal."user_id" = :userId`, { userId })
      .select("goal.id", "id")
      .addSelect("goal.title", "title")
      .addSelect("goal.description", "description")
      .addSelect('goal."targetCount"', "targetCount")
      .addSelect('goal."startDate"', "startDate")
      .addSelect('goal."endDate"', "endDate")
      .addSelect("goal.created_at", "created_at")
      .addSelect("goal.updated_at", "updated_at")
      .addSelect("COUNT(note.id)", "progress")
      .groupBy("goal.id")
      .orderBy('goal."endDate"', "ASC")
      .getRawMany();

    return rows.map((row) =>
      enrichGoal(
        {
          id: row.id,
          title: row.title,
          description: row.description,
          targetCount: Number(row.targetCount),
          startDate: String(row.startDate).slice(0, 10),
          endDate: String(row.endDate).slice(0, 10),
          user_id: userId,
          created_at: row.created_at,
          updated_at: row.updated_at,
        },
        Number(row.progress)
      )
    );
  }

  async findByIdAndUserId(id: string, userId: string): Promise<GoalModel | null> {
    const goal = await this.repository.findOne({
      where: { id, user: { id: userId } },
    });
    return goal ? toModel(goal, userId) : null;
  }

  async update(data: GoalRepositoryProtocol.UpdateParams): Promise<GoalModel> {
    const goal = await this.repository.findOne({
      where: { id: data.id, user: { id: data.userId } },
    });
    if (!goal) throw new Error("Meta não encontrada");
    if (data.title !== undefined) goal.title = data.title;
    if (data.description !== undefined) goal.description = data.description;
    if (data.targetCount !== undefined) goal.targetCount = data.targetCount;
    if (data.startDate !== undefined) goal.startDate = data.startDate;
    if (data.endDate !== undefined) goal.endDate = data.endDate;
    const saved = await this.repository.save(goal);
    return toModel(saved, data.userId);
  }

  async delete(id: string, userId: string): Promise<boolean> {
    const result = await this.repository.delete({ id, user: { id: userId } });
    return Boolean(result.affected);
  }
}
