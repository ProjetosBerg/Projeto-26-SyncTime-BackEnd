import * as yup from "yup";
import { periodValues } from "./utils/periodValues";

export const createRoutinesValidationSchema = yup.object().shape({
  type: yup
    .string()
    .required("Tipo é obrigatório")
    .min(2, "Tipo deve ter no mínimo 2 caracteres")
    .max(100, "Tipo deve ter no máximo 100 caracteres"),
  period: yup
    .string()
    .oneOf(periodValues, "Período deve ser Manhã, Tarde ou Noite")
    .nullable(),
  periods: yup
    .array()
    .of(
      yup
        .string()
        .oneOf(periodValues, "Período deve ser Manhã, Tarde ou Noite")
        .required("Período é obrigatório")
    )
    .min(1, "Selecione pelo menos um período")
    .max(3, "É possível selecionar no máximo três períodos")
    .test(
      "unique-periods",
      "Não é permitido repetir períodos",
      (periods) => !periods || new Set(periods).size === periods.length
    ),
  userId: yup.string().required("ID do Usuário é obrigatório"),
}).test(
  "single-period-format",
  'Informe apenas "period" ou "periods"',
  (data) => !data?.period || !data?.periods?.length
).test(
  "period-required-for-period-routine",
  "Selecione pelo menos um período",
  (data) =>
    data?.type !== "periodo" || Boolean(data.period || data.periods?.length)
);
