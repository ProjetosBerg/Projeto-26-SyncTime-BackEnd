import * as yup from "yup";

export const getDashboardCategoryValidationSchema = yup.object().shape({
  userId: yup.string().required("ID do Usuário é obrigatório"),
  categoryId: yup.string().optional(),
  startDate: yup
    .string()
    .optional()
    .matches(
      /^\d{4}-\d{2}-\d{2}$/,
      "Data inicial deve estar no formato YYYY-MM-DD"
    ),
  endDate: yup
    .string()
    .optional()
    .matches(
      /^\d{4}-\d{2}-\d{2}$/,
      "Data final deve estar no formato YYYY-MM-DD"
    )
    .test(
      "is-after-start",
      "Data final deve ser maior ou igual à data inicial",
      function (value) {
        const { startDate } = this.parent;
        if (!startDate || !value) return true;
        return new Date(value) >= new Date(startDate);
      }
    ),
  groupBy: yup
    .string()
    .optional()
    .oneOf(
      ["day", "week", "month", "year"],
      "groupBy deve ser: day, week, month ou year"
    ),
});
