import * as yup from "yup";
export const editRecordTypeValidationSchema = yup.object().shape({
  recordTypeId: yup
    .number()
    .required("ID do Tipo de Registro é obrigatório")
    .positive("ID deve ser positivo"),
  userId: yup.string().required("ID do Usuário é obrigatório"),

  name: yup
    .string()
    .min(2, "Nome deve ter no mínimo 2 caracteres")
    .max(50, "Nome deve ter no máximo 50 caracteres"),
  icone: yup.string().max(100, "Ícone deve ter no máximo 100 caracteres"),
});
