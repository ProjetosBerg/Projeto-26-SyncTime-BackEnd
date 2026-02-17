import * as yup from "yup";

export const getByUserIdRankUserValidationSchema = yup.object().shape({
  userId: yup.string().required("ID do Usuário é obrigatório"),
  year: yup
    .number()
    .integer()
    .min(1900, "Ano deve ser entre 1900 e 2100")
    .max(2100, "Ano deve ser entre 1900 e 2100")
    .required("Ano é obrigatório"),
  month: yup
    .number()
    .integer()
    .min(1, "Mês deve ser entre 1 e 12")
    .max(12, "Mês deve ser entre 1 e 12")
    .required("Mês é obrigatório"),
});
