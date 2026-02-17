import * as yup from "yup";
import { FieldType } from "@/domain/entities/mongo/CustomFieldsSchema";

export const createCustomFieldValidationSchema = yup.object().shape({
  type: yup
    .string()
    .required("Tipo é obrigatório")
    .oneOf(Object.values(FieldType), "Tipo inválido"),
  label: yup
    .string()
    .required("Rótulo é obrigatório")
    .min(2, "Rótulo deve ter no mínimo 2 caracteres")
    .max(100, "Rótulo deve ter no máximo 100 caracteres"),
  description: yup
    .string()
    .max(255, "Descrição deve ter no máximo 255 caracteres")
    .nullable()
    .optional(),
  categoryId: yup.string().required("ID da categoria é obrigatório"),
  recordTypeId: yup
    .array()
    .of(yup.number().required("ID do tipo de registro deve ser um número"))
    .min(1, "Pelo menos um ID de tipo de registro é necessário")
    .required("IDs de tipo de registro são obrigatórios"),
  name: yup
    .string()
    .required("Nome é obrigatório")
    .min(2, "Nome deve ter no mínimo 2 caracteres")
    .max(100, "Nome deve ter no máximo 100 caracteres"),
  required: yup.boolean().required("Campo obrigatório é obrigatório"),
  userId: yup.string().required("ID do usuário é obrigatório"),
  options: yup
    .array()
    .of(yup.string().required("Opção deve ser uma string"))
    .when("type", {
      is: FieldType.MULTIPLE,
      then: (schema) =>
        schema
          .min(1, "Pelo menos uma opção é necessária para o tipo MULTIPLE")
          .required("Opções são obrigatórias para o tipo MULTIPLE"),
      otherwise: (schema) => schema.optional().nullable(),
    }),
});
