import * as yup from "yup";

export const createRecordTypeValidationSchema = yup.object().shape({
  userId: yup.string().required("ID do Usuário é obrigatório"),
  name: yup
    .string()
    .required("Nome é obrigatório")
    .min(2, "Nome deve ter no mínimo 2 caracteres")
    .max(50, "Nome deve ter no máximo 50 caracteres"),
  icone: yup
    .string()
    .required("Ícone é obrigatório")
    .max(100, "Ícone deve ter no máximo 100 caracteres"),
});
