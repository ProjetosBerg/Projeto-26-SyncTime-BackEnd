import * as yup from "yup";

export const getByIdNotificationValidationSchema = yup.object().shape({
  userId: yup.string().required("ID do Usuário é obrigatório"),
  id: yup
    .string()
    .uuid("ID da notificação deve ser um UUID válido")
    .required("ID da notificação é obrigatório"),
});
