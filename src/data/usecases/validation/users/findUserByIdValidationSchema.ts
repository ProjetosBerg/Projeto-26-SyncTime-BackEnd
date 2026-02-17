import * as yup from "yup";

export const findUserByIdValidationSchema = yup.object().shape({
  id: yup.string().required(),
});
