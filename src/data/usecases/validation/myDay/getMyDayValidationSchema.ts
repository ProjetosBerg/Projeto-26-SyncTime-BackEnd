import * as yup from "yup";

const isValidDate = (value?: string | null): boolean => {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
};

export const getMyDayValidationSchema = yup.object().shape({
  userId: yup.string().required("ID do Usuário é obrigatório"),
  date: yup
    .string()
    .required("Data é obrigatória")
    .test("valid-date", "Data deve estar no formato YYYY-MM-DD", isValidDate),
});
