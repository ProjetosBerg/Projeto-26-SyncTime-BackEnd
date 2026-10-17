import {
  generateRecurrenceDates,
  MAX_RECURRENCE_OCCURRENCES,
} from "@/data/usecases/notes/helpers/generateRecurrenceDates";
import { BusinessRuleError } from "@/data/errors/BusinessRuleError";

const toDateOnly = (dates: Date[]) =>
  dates.map((date) => date.toISOString().slice(0, 10));

describe("generateRecurrenceDates", () => {
  test("should generate daily occurrences using the configured interval", () => {
    const dates = generateRecurrenceDates("2026-10-17", {
      frequency: "daily",
      interval: 2,
      endDate: "2026-10-23",
    });

    expect(toDateOnly(dates)).toEqual([
      "2026-10-17",
      "2026-10-19",
      "2026-10-21",
      "2026-10-23",
    ]);
  });

  test("should generate weekly occurrences on selected weekdays", () => {
    const dates = generateRecurrenceDates("2026-10-17", {
      frequency: "weekly",
      endDate: "2026-10-30",
      weekDays: [1, 3],
    });

    expect(toDateOnly(dates)).toEqual([
      "2026-10-19",
      "2026-10-21",
      "2026-10-26",
      "2026-10-28",
    ]);
  });

  test("should use the start weekday when weekly days are omitted", () => {
    const dates = generateRecurrenceDates("2026-10-17", {
      frequency: "weekly",
      interval: 2,
      endDate: "2026-11-14",
    });

    expect(toDateOnly(dates)).toEqual([
      "2026-10-17",
      "2026-10-31",
      "2026-11-14",
    ]);
  });

  test("should skip months that do not have the original day", () => {
    const dates = generateRecurrenceDates("2027-01-31", {
      frequency: "monthly",
      endDate: "2027-05-31",
    });

    expect(toDateOnly(dates)).toEqual([
      "2027-01-31",
      "2027-03-31",
      "2027-05-31",
    ]);
  });

  test("should reject an end date before the start date", () => {
    expect(() =>
      generateRecurrenceDates("2026-10-17", {
        frequency: "daily",
        endDate: "2026-10-16",
      })
    ).toThrow(BusinessRuleError);
  });

  test("should limit the number of generated occurrences", () => {
    expect(() =>
      generateRecurrenceDates("2026-01-01", {
        frequency: "daily",
        endDate: "2027-01-02",
      })
    ).toThrow(
      `A recorrência não pode ultrapassar ${MAX_RECURRENCE_OCCURRENCES} ocorrências`
    );
  });
});
