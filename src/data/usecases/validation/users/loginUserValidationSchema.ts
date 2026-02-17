import * as yup from "yup";

export const loginUserValidationSchema = yup.object().shape({
  login: yup
    .string()
    .required("Login é obrigatório")
    .min(2, "Login deve ter no mínimo 2 caracteres")
    .max(50, "Login deve ter no máximo 50 caracteres")
    .matches(
      /^[a-z0-9._-]+$/,
      "Login deve conter apenas letras minúsculas, números, ponto (.), underline (_) ou traço (-)"
    ),

  password: yup
    .string()
    .required("Senha é obrigatória")
    .min(6, "Senha deve ter no mínimo 6 caracteres")
    .max(100, "Senha deve ter no máximo 100 caracteres"),
});
