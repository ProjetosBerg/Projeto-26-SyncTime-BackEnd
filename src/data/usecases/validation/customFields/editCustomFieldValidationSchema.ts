import * as yup from "yup";
import { FieldType } from "@/domain/entities/mongo/CustomFieldsSchema";

export const editCustomFieldValidationSchema = yup.object().shape({
  customFieldsId: yup
    .string()
    .required("ID do campo personalizado é obrigatório"),
  userId: yup.string().required("ID do usuário é obrigatório"),
  type: yup
    .string()
    .oneOf(Object.values(FieldType), "Tipo inválido")
    .optional(),
  label: yup
    .string()
    .min(2, "Rótulo deve ter no mínimo 2 caracteres")
    .max(100, "Rótulo deve ter no máximo 100 caracteres")
    .optional(),
  name: yup
    .string()
    .min(2, "Nome deve ter no mínimo 2 caracteres")
    .max(100, "Nome deve ter no máximo 100 caracteres")
    .optional(),
  categoryId: yup.string().optional(),
  description: yup
    .string()
    .max(255, "Descrição deve ter no máximo 255 caracteres")
    .nullable()
    .optional(),
  options: yup
    .array()
    .of(
      yup.object().shape({
        value: yup
          .string()
          .required("Valor da opção é obrigatório")
          .min(1, "Valor da opção deve ter no mínimo 1 caractere"),
        recordTypeIds: yup
          .array()
          .of(yup.number().required("ID do tipo de registro é obrigatório"))
          .required("IDs do tipo de registro são obrigatórios")
          .min(1, "Pelo menos um ID de tipo de registro é necessário"),
      })
    )
    .when("type", {
      is: FieldType.MULTIPLE,
      then: (schema) =>
        schema
          .required("Opções são obrigatórias para o tipo MULTIPLE")
          .min(1, "Pelo menos uma opção é necessária para o tipo MULTIPLE"),
      otherwise: (schema) => schema.optional().nullable(),
    }),
  recordTypeId: yup
    .array()
    .of(yup.number().required("ID do tipo de registro é obrigatório"))
    .min(1, "Pelo menos um ID de tipo de registro é necessário")
    .optional(),
  required: yup.boolean().optional(),
});
