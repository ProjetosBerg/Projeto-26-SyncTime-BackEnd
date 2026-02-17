import * as yup from "yup";
export const deleteRecordTypeValidationSchema = yup.object().shape({
  recordTypeId: yup
    .number()
    .required("ID do Tipo de Registro é obrigatório")
    .positive("ID deve ser positivo"),
  userId: yup.string().required("ID do Usuário é obrigatório"),
});
