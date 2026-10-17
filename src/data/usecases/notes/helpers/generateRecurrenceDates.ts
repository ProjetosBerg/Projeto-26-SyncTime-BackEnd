import { BusinessRuleError } from "@/data/errors/BusinessRuleError";
import {
  RecurrenceConfig,
  RecurrenceFrequency,
} from "@/domain/models/postgres/NotesModel";

export const MAX_RECURRENCE_OCCURRENCES = 366;

const DATE_ONLY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

export const parseDateOnly = (value: Date | string): Date | null => {
  if (typeof value === "string") {
    const dateOnly = value.slice(0, 10);
    const match = DATE_ONLY_PATTERN.exec(dateOnly);

    if (match) {
      const year = Number(match[1]);
      const month = Number(match[2]);
      const day = Number(match[3]);
      const parsed = new Date(Date.UTC(year, month - 1, day));

      if (
        parsed.getUTCFullYear() === year &&
        parsed.getUTCMonth() === month - 1 &&
        parsed.getUTCDate() === day
      ) {
        return parsed;
      }
    }

    return null;
  }

  if (!(value instanceof Date) || Number.isNaN(value.getTime())) {
    return null;
  }

  return new Date(
    Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate())
  );
};

const addDays = (date: Date, amount: number): Date => {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() + amount);
  return result;
};

const pushOccurrence = (dates: Date[], date: Date): void => {
  if (dates.length >= MAX_RECURRENCE_OCCURRENCES) {
    throw new BusinessRuleError(
      `A recorrência não pode ultrapassar ${MAX_RECURRENCE_OCCURRENCES} ocorrências`
    );
  }

  dates.push(date);
};

const generateDailyDates = (
  startDate: Date,
  endDate: Date,
  interval: number
): Date[] => {
  const dates: Date[] = [];

  for (
    let current = new Date(startDate);
    current <= endDate;
    current = addDays(current, interval)
  ) {
    pushOccurrence(dates, new Date(current));
  }

  return dates;
};

const generateWeeklyDates = (
  startDate: Date,
  endDate: Date,
  interval: number,
  weekDays?: number[]
): Date[] => {
  const dates: Date[] = [];
  const selectedDays = new Set(
    weekDays?.length ? weekDays : [startDate.getUTCDay()]
  );

  for (
    let current = new Date(startDate), elapsedDays = 0;
    current <= endDate;
    current = addDays(current, 1), elapsedDays += 1
  ) {
    const weekIndex = Math.floor(elapsedDays / 7);
    if (weekIndex % interval === 0 && selectedDays.has(current.getUTCDay())) {
      pushOccurrence(dates, new Date(current));
    }
  }

  return dates;
};

const generateMonthlyDates = (
  startDate: Date,
  endDate: Date,
  interval: number
): Date[] => {
  const dates: Date[] = [];
  const anchorDay = startDate.getUTCDate();

  for (let monthOffset = 0; ; monthOffset += interval) {
    const firstDayOfMonth = new Date(
      Date.UTC(
        startDate.getUTCFullYear(),
        startDate.getUTCMonth() + monthOffset,
        1
      )
    );

    if (firstDayOfMonth > endDate) break;

    const occurrence = new Date(
      Date.UTC(
        firstDayOfMonth.getUTCFullYear(),
        firstDayOfMonth.getUTCMonth(),
        anchorDay
      )
    );

    if (
      occurrence.getUTCMonth() === firstDayOfMonth.getUTCMonth() &&
      occurrence <= endDate
    ) {
      pushOccurrence(dates, occurrence);
    }
  }

  return dates;
};

const generators: Record<
  RecurrenceFrequency,
  (
    startDate: Date,
    endDate: Date,
    interval: number,
    weekDays?: number[]
  ) => Date[]
> = {
  daily: generateDailyDates,
  weekly: generateWeeklyDates,
  monthly: generateMonthlyDates,
};

export const generateRecurrenceDates = (
  dateOfNote: Date | string,
  recurrence: RecurrenceConfig
): Date[] => {
  const startDate = parseDateOnly(dateOfNote);
  const endDate = parseDateOnly(recurrence.endDate);

  if (!startDate || !endDate) {
    throw new BusinessRuleError("Período de recorrência inválido");
  }

  if (endDate < startDate) {
    throw new BusinessRuleError(
      "A data final da recorrência deve ser igual ou posterior à data inicial"
    );
  }

  const interval = recurrence.interval || 1;
  return generators[recurrence.frequency](
    startDate,
    endDate,
    interval,
    recurrence.weekDays
  );
};
