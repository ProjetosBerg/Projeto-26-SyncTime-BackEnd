import * as yup from "yup";

export const getByIdCustomFieldValidationSchema = yup.object().shape({
  customFieldsId: yup
    .string()
    .required("ID do campo personalizado é obrigatório"),
  userId: yup.string().required("ID do usuário é obrigatório"),
});
