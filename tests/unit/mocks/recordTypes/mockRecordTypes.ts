import { RecordTypeModel } from "@/domain/models/postgres/RecordTypesModel";
import { faker } from "@faker-js/faker";

export const mockRecordType: RecordTypeModel = {
  id: 1,
  user_id: faker.string.uuid(),
  name: "Compras",
  icone: "shopping-cart",
  created_at: new Date(),
  updated_at: new Date(),
};
