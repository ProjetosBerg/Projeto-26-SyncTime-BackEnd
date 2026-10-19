import { calculateReminderAt } from "@/data/usecases/notes/helpers/calculateReminderAt";

describe("calculateReminderAt", () => {
  test("should calculate a reminder using the browser timezone offset", () => {
    const reminderAt = calculateReminderAt(
      "2026-10-19",
      "09:00",
      15,
      180
    );

    expect(reminderAt.toISOString()).toBe("2026-10-19T11:45:00.000Z");
  });

  test("should support a reminder at the activity start time", () => {
    const reminderAt = calculateReminderAt(
      "2026-10-19",
      "09:00",
      0,
      -120
    );

    expect(reminderAt.toISOString()).toBe("2026-10-19T07:00:00.000Z");
  });
});
