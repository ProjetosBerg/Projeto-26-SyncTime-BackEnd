import { FieldType } from "@/domain/entities/mongo/CustomFieldsSchema";

export type CustomFieldValueWithMetadata = {
  id: string;
  custom_field_id: string;
  value: any;
  label: string;
  type: FieldType;
  required: boolean;
};
