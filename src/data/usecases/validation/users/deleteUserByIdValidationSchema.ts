import * as yup from "yup";

export const deleteUserByIdValidationSchema = yup.object().shape({
  id: yup.string().required(),
});
