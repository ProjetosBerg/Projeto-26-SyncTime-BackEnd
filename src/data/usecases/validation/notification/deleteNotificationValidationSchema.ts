import * as yup from "yup";

export const deleteNotificationValidationSchema = yup.object().shape({
  userId: yup.string().required("ID do Usuário é obrigatório"),
  ids: yup
    .array()
    .of(yup.string().uuid("ID da notificação deve ser um UUID válido"))
    .min(1, "Pelo menos um ID de notificação deve ser fornecido")
    .max(100, "Máximo de 100 notificações podem ser deletadas por vez")
    .required("IDs das notificações são obrigatórios"),
});
