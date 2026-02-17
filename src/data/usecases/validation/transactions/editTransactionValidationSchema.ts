import * as yup from "yup";

export const editTransactionValidationSchema = yup.object().shape({
  transactionId: yup.string().required("ID da transação é obrigatório"),
  userId: yup.string().required("ID do Usuário é obrigatório"),
  title: yup
    .string()
    .min(2, "Título deve ter no mínimo 2 caracteres")
    .max(100, "Título deve ter no máximo 100 caracteres")
    .optional(),
  description: yup
    .string()
    .max(255, "Descrição deve ter no máximo 255 caracteres")
    .nullable()
    .optional(),
  amount: yup.number().min(0, "Valor deve ser maior ou igual a 0").optional(),
  transactionDate: yup
    .date()
    .typeError("Data da transação deve ser uma data válida")
    .optional(),
  monthlyRecordId: yup.string().optional(),
  categoryId: yup.string().optional(),
});
