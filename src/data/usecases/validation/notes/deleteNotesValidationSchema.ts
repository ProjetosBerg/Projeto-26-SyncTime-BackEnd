import * as yup from "yup";

export const deleteNotesValidationSchema = yup.object().shape({
  noteId: yup
    .string()
    .required("ID da anotação é obrigatório")
    .uuid("ID da anotação deve ser um UUID válido"),
  userId: yup.string().required("ID do Usuário é obrigatório"),
});
