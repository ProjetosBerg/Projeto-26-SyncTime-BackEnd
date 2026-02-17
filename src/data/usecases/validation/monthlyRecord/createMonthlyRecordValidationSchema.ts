import * as yup from "yup";

export const createMonthlyRecordValidationSchema = yup.object().shape({
  title: yup
    .string()
    .required("Título é obrigatório")
    .min(2, "Título deve ter no mínimo 2 caracteres")
    .max(100, "Título deve ter no máximo 100 caracteres"),
  description: yup
    .string()
    .max(255, "Descrição deve ter no máximo 255 caracteres")
    .nullable(),
  goal: yup
    .string()
    .required("Meta é obrigatória")
    .max(255, "Meta deve ter no máximo 255 caracteres"),
  status: yup
    .string()
    .required("Status é obrigatório")
    .max(255, "Meta deve ter no máximo 255 caracteres"),
  initial_balance: yup
    .number()
    .transform((value, originalValue) => (originalValue === "" ? null : value))
    .nullable()
    .min(0, "Saldo inicial deve ser maior ou igual a 0"),
  month: yup
    .number()
    .required("Mês é obrigatório")
    .integer("Mês deve ser um número inteiro")
    .min(1, "Mês deve estar entre 1 e 12")
    .max(12, "Mês deve estar entre 1 e 12"),
  year: yup
    .number()
    .required("Ano é obrigatório")
    .integer("Ano deve ser um número inteiro")
    .min(2000, "Ano deve ser maior ou igual a 2000"),
  categoryId: yup.string().required("ID da categoria é obrigatório"),
  userId: yup.string().required("Usuário é obrigatório"),
});
