import * as yup from "yup";

export const getByUserIdMonthlyRecordValidationSchema = yup.object().shape({
  userId: yup.string().required("ID do Usuário é obrigatório"),
  categoryId: yup.string().required("ID da categoria é obrigatório"),
  page: yup.number().optional().min(1, "Página deve ser maior ou igual a 1"),
  limit: yup.number().optional().min(1, "Limite deve ser maior ou igual a 1"),
});
