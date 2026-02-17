import * as yup from "yup";

export const getByUserIdRecordTypeValidationSchema = yup.object().shape({
  userId: yup.string().required("ID do Usuário é obrigatório"),
  page: yup.number().optional().min(1, "Página deve ser maior ou igual a 1"),
  limit: yup.number().optional().min(1, "Limite deve ser maior ou igual a 1"),
  search: yup.string().optional(),
});
