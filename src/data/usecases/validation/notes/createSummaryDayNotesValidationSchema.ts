import * as yup from "yup";

export const createSummaryDayNotesValidationSchema = yup.object().shape({
  date: yup
    .string()
    .required("Data é obrigatória")
    .matches(/^\d{4}-\d{2}-\d{2}$/, "Data deve estar no formato YYYY-MM-DD"),
  userId: yup.string().required("ID do Usuário é obrigatório"),
  routine_id: yup
    .string()
    .uuid("ID da rotina deve ser um UUID válido")
    .nullable(),
});
