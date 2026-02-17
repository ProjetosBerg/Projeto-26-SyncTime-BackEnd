import * as yup from "yup";

export const getByUserIdRoutinesValidationSchema = yup.object().shape({
  userId: yup.string().required("ID do Usuário é obrigatório"),
  page: yup.number().min(1, "Página deve ser maior que 0").default(1),
  limit: yup.number().min(1, "Limite deve ser maior que 0").default(10),
  search: yup
    .string()
    .max(100, "Busca deve ter no máximo 100 caracteres")
    .default(""),
  sortBy: yup
    .string()
    .max(50, "SortBy deve ter no máximo 50 caracteres")
    .default("type"),
  order: yup
    .string()
    .oneOf(["ASC", "DESC"], "Ordem deve ser ASC ou DESC")
    .default("ASC"),
  year: yup.number().min(2000, "Ano deve ser maior ou igual a 2000").optional(),
  month: yup
    .number()
    .min(1, "Mês deve ser entre 1 e 12")
    .max(12, "Mês deve ser entre 1 e 12")
    .optional(),
});
