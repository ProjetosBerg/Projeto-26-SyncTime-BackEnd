import * as yup from "yup";

export const editUserByIdValidationSchema = yup.object().shape({
  name: yup
    .string()
    .min(2, "Nome deve ter no mínimo 2 caracteres")
    .max(50, "Nome deve ter no máximo 50 caracteres"),

  email: yup
    .string()
    .email("E-mail inválido")
    .test(
      "is-lowercase",
      "E-mail deve estar em minúsculo",
      (value) => !value || value === value.toLowerCase()
    ),

  security_questions: yup
    .array()
    .min(1, "Pelo menos uma questão de segurança é necessária")
    .of(
      yup.object().shape({
        question: yup.string().required("Pergunta de segurança é obrigatória"),
        answer: yup.string().required("Resposta de segurança é obrigatória"),
      })
    ),
  bio: yup
    .string()
    .max(200, "Bio deve ter no máximo 200 caracteres")
    .nullable(),
  imageUrl: yup.string().url("URL da imagem inválida").optional(),
  publicId: yup.string().optional(),
});
