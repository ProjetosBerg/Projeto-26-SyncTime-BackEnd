import * as yup from "yup";

export const deleteMonthlyRecordValidationSchema = yup.object().shape({
  monthlyRecordId: yup.string().required("ID do registro mensal é obrigatório"),
  userId: yup.string().required("ID do Usuário é obrigatório"),
});
