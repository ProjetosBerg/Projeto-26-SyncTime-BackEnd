import * as yup from "yup";

export const editMonthlyRecordValidationSchema = yup.object().shape({
  monthlyRecordId: yup.string().required("ID do registro mensal é obrigatório"),
  userId: yup.string().required("ID do Usuário é obrigatório"),
  categoryId: yup.string().required("ID da Categoria é obrigatória"),
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
  goal: yup
    .string()
    .max(255, "Meta deve ter no máximo 255 caracteres")
    .optional(),
  status: yup
    .string()
    .max(255, "Status deve ter no máximo 255 caracteres")
    .optional(),
  initial_balance: yup
    .number()
    .transform((value, originalValue) => (originalValue === "" ? null : value))
    .nullable()
    .min(0, "Saldo inicial deve ser maior ou igual a 0")
    .optional(),
});
