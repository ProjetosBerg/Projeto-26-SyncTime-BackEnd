import * as yup from "yup";

export const registerUserValidationSchema = yup.object().shape({
  name: yup
    .string()
    .required("Nome é obrigatório")
    .min(2, "Nome deve ter no mínimo 2 caracteres")
    .max(50, "Nome deve ter no máximo 50 caracteres"),

  login: yup
    .string()
    .required("Login é obrigatório")
    .min(2, "Login deve ter no mínimo 2 caracteres")
    .max(50, "Login deve ter no máximo 50 caracteres")
    .matches(
      /^[a-z0-9._-]+$/,
      "Login deve conter apenas letras minúsculas, números, ponto (.), underline (_) ou traço (-)"
    ),

  email: yup
    .string()
    .required("E-mail é obrigatório")
    .email("E-mail inválido")
    .test(
      "is-lowercase",
      "E-mail deve estar em minúsculo",
      (value) => !value || value === value.toLowerCase()
    ),

  password: yup
    .string()
    .required("Senha é obrigatória")
    .min(6, "Senha deve ter no mínimo 6 caracteres")
    .max(100, "Senha deve ter no máximo 100 caracteres"),
  confirmpassword: yup
    .string()
    .required("Confirmação de senha é obrigatória")
    .oneOf([yup.ref("password")], "Senhas diferentes"),

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
  imageUrl: yup.string().url("URL da imagem inválida").optional(),
  publicId: yup.string().optional(),
});
