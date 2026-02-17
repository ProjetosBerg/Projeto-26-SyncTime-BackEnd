import * as yup from "yup";

export const getByIdRoutinesValidationSchema = yup.object().shape({
  routineId: yup
    .string()
    .required("ID da rotina é obrigatório")
    .uuid("ID da rotina deve ser um UUID válido"),
  userId: yup.string().required("ID do Usuário é obrigatório"),
});
