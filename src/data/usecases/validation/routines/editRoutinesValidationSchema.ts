import * as yup from "yup";
import { periodValues } from "./utils/periodValues";

export const editRoutinesValidationSchema = yup.object().shape({
  type: yup
    .string()
    .min(2, "Tipo deve ter no mínimo 2 caracteres")
    .max(100, "Tipo deve ter no máximo 100 caracteres")
    .nullable(),
  period: yup
    .string()
    .oneOf(periodValues, "Período deve ser Manhã, Tarde ou Noite")
    .nullable(),
  routineId: yup
    .string()
    .required("ID da rotina é obrigatório")
    .uuid("ID da rotina deve ser um UUID válido"),
  userId: yup.string().required("ID do Usuário é obrigatório"),
});
