import * as yup from "yup";

export const createCategoryValidationSchema = yup.object().shape({
  name: yup
    .string()
    .required("Nome é obrigatório")
    .min(2, "Nome deve ter no mínimo 2 caracteres")
    .max(100, "Nome deve ter no máximo 100 caracteres"),
  description: yup
    .string()
    .max(255, "Descrição deve ter no máximo 255 caracteres")
    .nullable(),
  type: yup.string().required("Tipo é obrigatório"),
  recordTypeId: yup
    .number()
    .required("ID do tipo de registro é obrigatório")
    .positive("ID do tipo de registro deve ser positivo"),
  userId: yup.string().required("ID do Usuário é obrigatório"),
});
