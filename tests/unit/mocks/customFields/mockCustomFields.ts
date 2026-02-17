import { FieldType } from "@/domain/entities/mongo/CustomFieldsSchema";
import { mockCategory } from "../category/mockCategory";

export const mockCustomField = {
  id: "custom-field-123",
  type: FieldType.TEXT,
  label: "Custom Text Field",
  name: "custom_text_field",
  category_id: mockCategory.id,
  user_id: "user-123",
  description: "A custom text field for transactions",
  options: undefined,
  record_type_id: [1, 2],
  required: false,
  created_at: new Date("2025-07-19T09:00:00.000Z"),
  updated_at: new Date("2025-07-19T09:00:00.000Z"),
};
