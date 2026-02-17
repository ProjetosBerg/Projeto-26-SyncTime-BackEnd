import * as yup from "yup";

export const getByUserIdNotesValidationSchema = yup.object().shape({
  userId: yup.string().required("ID do Usuário é obrigatório"),
  page: yup.number().min(1, "Página deve ser maior que 0").default(1),
  limit: yup
    .number()
    .min(1, "Limite deve ser maior que 0")
    .max(100, "Limite máximo de 100 registros")
    .default(10),
  search: yup
    .string()
    .max(100, "Busca deve ter no máximo 100 caracteres")
    .default(""),
  sortBy: yup
    .string()
    .max(50, "SortBy deve ter no máximo 50 caracteres")
    .default("activity"),
  order: yup
    .string()
    .oneOf(["ASC", "DESC"], "Ordem deve ser ASC ou DESC")
    .default("ASC"),
});
