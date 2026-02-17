import { FieldType } from "@/domain/entities/mongo/CustomFieldsSchema";
import { CategoryModel } from "../postgres/CategoryModel";
import { UserModel } from "../postgres/UserModel";

export type Option = {
  value: string;
  recordTypeIds: number[];
};

export type CustomFieldModel = {
  id?: string;
  type: FieldType;
  label: string;
  description?: string | null;
  options?: Option[];
  category_id: CategoryModel["id"];
  record_type_id: number[];
  name: string;
  required: boolean;
  user_id: UserModel["id"];
  created_at?: Date;
  updated_at?: Date;
};
