import * as yup from "yup";

export const editCategoryValidationSchema = yup.object().shape({
  categoryId: yup.string().required("ID da categoria é obrigatório"),
  name: yup
    .string()
    .min(2, "Nome deve ter no mínimo 2 caracteres")
    .max(100, "Nome deve ter no máximo 100 caracteres"),
  description: yup
    .string()
    .max(255, "Descrição deve ter no máximo 255 caracteres")
    .nullable(),
  type: yup.string(),
  recordTypeId: yup
    .number()
    .required("ID do tipo de registro é obrigatório")
    .positive("ID do tipo de registro deve ser positivo"),
  userId: yup.string().required("ID do Usuário é obrigatório"),
});
