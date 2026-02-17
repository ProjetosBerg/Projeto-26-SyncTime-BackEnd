import * as yup from "yup";

export const deleteCategoryValidationSchema = yup.object().shape({
  categoryId: yup.string().required("ID da categoria é obrigatório"),
  userId: yup.string().required("ID do Usuário é obrigatório"),
});
