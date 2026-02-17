import * as yup from "yup";

export const deleteTransactionValidationSchema = yup.object().shape({
  transactionId: yup.string().required("ID da transação é obrigatório"),
  userId: yup.string().required("ID do Usuário é obrigatório"),
});
