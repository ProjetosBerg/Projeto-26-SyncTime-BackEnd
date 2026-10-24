import * as yup from "yup";
import { NotFoundError } from "@/data/errors/NotFoundError";
import { GoalRepositoryProtocol } from "@/infra/db/interfaces/goalRepositoryProtocol";

type GoalInput = {
  title: string;
  description?: string | null;
  targetCount: number;
  startDate: string;
  endDate: string;
};

const fields = {
  title: yup.string().trim().min(2).max(100).required("Título é obrigatório"),
  description: yup.string().trim().max(500).nullable(),
  targetCount: yup.number().integer().min(1).max(100000).required("Quantidade alvo é obrigatória"),
  startDate: yup.string().matches(/^\d{4}-\d{2}-\d{2}$/).required("Data inicial é obrigatória"),
  endDate: yup.string().matches(/^\d{4}-\d{2}-\d{2}$/).required("Data final é obrigatória"),
};

const createSchema = yup.object().shape(fields).test(
  "date-range",
  "A data final deve ser igual ou posterior à inicial",
  (value) => !value || value.endDate >= value.startDate
);
const updateSchema = yup.object().shape({
  title: fields.title.optional(),
  description: fields.description.optional(),
  targetCount: fields.targetCount.optional(),
  startDate: fields.startDate.optional(),
  endDate: fields.endDate.optional(),
});

export class GoalService {
  constructor(private readonly repository: GoalRepositoryProtocol) {}

  list(userId: string) {
    return this.repository.findByUserId(userId);
  }

  async create(userId: string, input: unknown) {
    const data = (await createSchema.validate(input, {
      abortEarly: false,
      stripUnknown: true,
    })) as GoalInput;
    return this.repository.create({ ...data, userId });
  }

  async update(id: string, userId: string, input: unknown) {
    const current = await this.repository.findByIdAndUserId(id, userId);
    if (!current) throw new NotFoundError("Meta não encontrada");
    const data = (await updateSchema.validate(input, {
      abortEarly: false,
      stripUnknown: true,
    })) as Partial<GoalInput>;
    const startDate = data.startDate ?? current.startDate;
    const endDate = data.endDate ?? current.endDate;
    if (endDate < startDate) {
      throw new yup.ValidationError(
        "A data final deve ser igual ou posterior à inicial",
        data,
        "endDate"
      );
    }
    return this.repository.update({ ...data, id, userId });
  }

  async delete(id: string, userId: string) {
    if (!(await this.repository.delete(id, userId))) {
      throw new NotFoundError("Meta não encontrada");
    }
  }
}
