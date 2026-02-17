import { RoutineModel } from "@/domain/models/postgres/RoutinModel";
import { faker } from "@faker-js/faker/locale/af_ZA";

export const mockRoutine: RoutineModel = {
  id: faker.string.uuid(),
  type: "Despesa",
  period: "Manhã",
  user_id: "user-123",
  created_at: new Date(),
  updated_at: new Date(),
};
