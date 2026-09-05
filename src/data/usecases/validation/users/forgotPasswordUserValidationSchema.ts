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
    .max(5, "No máximo 5 perguntas de segurança são permitidas")
    .of(
      yup.object().shape({
        question: yup.string().max(100).required("Pergunta de segurança é obrigatória"),
        answer: yup.string().max(200).required("Resposta de segurança é obrigatória"),
      })
    )
    .test("unique-questions", "As perguntas devem ser diferentes", (value) =>
      value
        ? new Set(
            value.map(
              (item) =>
                (item as { question?: string } | undefined)?.question
            )
          ).size === value.length
        : true
    ),
});
