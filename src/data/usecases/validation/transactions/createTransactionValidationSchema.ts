import * as yup from "yup";

export const createTransactionValidationSchema = yup.object().shape({
  title: yup
    .string()
    .required("Título é obrigatório")
    .min(2, "Título deve ter no mínimo 2 caracteres")
    .max(100, "Título deve ter no máximo 100 caracteres"),
  description: yup
    .string()
    .max(255, "Descrição deve ter no máximo 255 caracteres")
    .nullable()
    .optional(),
  amount: yup
    .number()
    .min(0, "Valor deve ser maior ou igual a 0")
    .nullable()
    .optional(),
  transactionDate: yup
    .date()
    .required("Data da transação é obrigatória")
    .typeError("Data da transação deve ser uma data válida"),
  monthlyRecordId: yup.string().required("Registro mensal é obrigatório"),
  categoryId: yup.string().required("Categoria é obrigatória"),
  userId: yup.string().required("Usuário é obrigatório"),
});
