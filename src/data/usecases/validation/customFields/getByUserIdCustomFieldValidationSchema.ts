import * as yup from "yup";

export const getByUserIdCustomFieldValidationSchema = yup.object().shape({
  userId: yup.string().required("ID do usuário é obrigatório"),
});
