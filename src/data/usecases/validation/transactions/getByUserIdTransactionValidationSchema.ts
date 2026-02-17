import * as yup from "yup";

export const getByUserIdTransactionValidationSchema = yup.object().shape({
  userId: yup.string().required("ID do Usuário é obrigatório"),
  monthlyRecordId: yup.string().required("Registro mensal é obrigatório"),
});
