import * as yup from "yup";

export const getByUserIdTransactionValidationSchema = yup.object().shape({
  userId: yup.string().required("ID do Usuário é obrigatório"),
  monthlyRecordId: yup.string().required("Registro mensal é obrigatório"),
  page: yup
    .number()
    .integer("Página deve ser um número inteiro")
    .min(1, "Página deve ser maior ou igual a 1")
    .optional(),
  limit: yup
    .number()
    .integer("Limite deve ser um número inteiro")
    .min(1, "Limite deve ser maior ou igual a 1")
    .max(100, "Limite deve ser menor ou igual a 100")
    .optional(),
  paginate: yup.boolean().optional(),
  sortBy: yup.string().max(150).optional(),
  order: yup.string().oneOf(["", "asc", "desc"]).optional(),
  filters: yup
    .array()
    .of(
      yup.object().shape({
        field: yup.string().required(),
        operator: yup
          .string()
          .oneOf([
            "equals",
            "contains",
            "startsWith",
            "endsWith",
            "gt",
            "gte",
            "lt",
            "lte",
            "between",
            "in",
          ])
          .required(),
        value: yup.mixed().required(),
        value2: yup.mixed().nullable().optional(),
      })
    )
    .optional(),
});
