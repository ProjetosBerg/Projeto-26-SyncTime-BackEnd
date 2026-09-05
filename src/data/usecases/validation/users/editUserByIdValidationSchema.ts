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

  securityQuestions: yup
    .array()
    .min(1, "Pelo menos uma questão de segurança é necessária")
    .max(5, "No máximo 5 perguntas de segurança são permitidas")
    .test("unique-questions", "As perguntas devem ser diferentes", (value) =>
      value ? new Set(value.map((item) => item?.question)).size === value.length : true
    )
    .of(
      yup.object().shape({
        question: yup.string().max(100).required("Pergunta de segurança é obrigatória"),
        answer: yup.string().max(200).required("Resposta de segurança é obrigatória"),
      })
    ),
  bio: yup
    .string()
    .max(200, "Bio deve ter no máximo 200 caracteres")
    .nullable(),
  imageUrl: yup.string().url("URL da imagem inválida").optional(),
  publicId: yup.string().optional(),
});
