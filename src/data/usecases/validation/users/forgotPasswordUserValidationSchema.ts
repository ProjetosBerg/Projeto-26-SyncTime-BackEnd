import * as yup from "yup";

export const forgotPasswordUserValidationSchema = yup.object().shape({
  login: yup
    .string()
    .required("Login é obrigatório")
    .min(2, "Login deve ter no mínimo 2 caracteres")
    .max(50, "Login deve ter no máximo 50 caracteres")
    .matches(
      /^[a-z0-9._-]+$/,
      "Login deve conter apenas letras minúsculas, números, ponto (.), underline (_) ou traço (-)"
    ),

  newPassword: yup
    .string()
    .required("Senha é obrigatória")
    .min(6, "Senha deve ter no mínimo 6 caracteres")
    .max(100, "Senha deve ter no máximo 100 caracteres"),
  confirmNewPassword: yup
    .string()
    .required("Confirmação de senha é obrigatória")
    .oneOf(
      [yup.ref("newPassword")],
      "A nova senha e a confirmação não coincidem"
    ),

  securityQuestions: yup
    .array()
    .required("Perguntas de segurança é obrigatórias")
    .min(1, "Pelo menos uma questão de segurança é necessária")
    .of(
      yup.object().shape({
        question: yup.string().required("Pergunta de segurança é obrigatória"),
        answer: yup.string().required("Resposta de segurança é obrigatória"),
      })
    ),
});
