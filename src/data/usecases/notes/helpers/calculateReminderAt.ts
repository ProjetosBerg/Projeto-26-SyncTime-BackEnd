import { BusinessRuleError } from "@/data/errors/BusinessRuleError";
import { parseDateOnly } from "./generateRecurrenceDates";

const TIME_PATTERN = /^(\d{1,2}):(\d{2})/;

export const calculateReminderAt = (
  dateOfNote: Date | string,
  startTime: string,
  minutesBefore: number,
  timezoneOffset: number
): Date => {
  const date = parseDateOnly(dateOfNote);
  const time = TIME_PATTERN.exec(startTime);

  if (!date || !time) {
    throw new BusinessRuleError(
      "Data e horário de início são obrigatórios para criar um lembrete"
    );
  }

  const startAtUtc = Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
    Number(time[1]),
    Number(time[2])
  );

  return new Date(
    startAtUtc + timezoneOffset * 60_000 - minutesBefore * 60_000
  );
};
