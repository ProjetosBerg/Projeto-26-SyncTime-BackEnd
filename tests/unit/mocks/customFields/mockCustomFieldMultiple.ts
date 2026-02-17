import { FieldType } from "@/domain/entities/mongo/CustomFieldsSchema";
import { mockCategory } from "../category/mockCategory";

export const mockCustomFieldMultiple = {
  id: "custom-field-456",
  type: FieldType.MULTIPLE,
  label: "Custom Multiple Field",
  name: "custom_multiple_field",
  category_id: mockCategory.id,
  user_id: "user-123",
  description: "A custom multiple-choice field",
  options: [
    { value: "Option 1", recordTypeIds: [1, 2] },
    { value: "Option 2", recordTypeIds: [3] },
  ],
  record_type_id: [1, 2, 3],
  required: true,
  created_at: new Date("2025-07-19T09:00:00.000Z"),
  updated_at: new Date("2025-07-19T09:00:00.000Z"),
};
