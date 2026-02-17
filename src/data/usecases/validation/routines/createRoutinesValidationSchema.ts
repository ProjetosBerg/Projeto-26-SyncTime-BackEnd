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
  userId: yup.string().required("ID do Usuário é obrigatório"),
});
