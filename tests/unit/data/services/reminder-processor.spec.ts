import { NotificationModel } from "@/domain/models/postgres/NotificationModel";
import { NotificationRepositoryProtocol } from "@/infra/db/interfaces/notificationRepositoryProtocol";
import {
  DueReminder,
  ReminderRepositoryProtocol,
} from "@/infra/db/interfaces/reminderRepositoryProtocol";
import logger from "@/loaders/logger";
import { ReminderProcessor } from "@/services/reminderProcessor";

const makeReminder = (id: string): DueReminder => ({
  id,
  user_id: "user-1",
  routine_id: "routine-1",
  activity: `Atividade ${id}`,
  startTime: "09:00:00",
  dateOfNote: new Date("2026-10-30T00:00:00.000Z"),
  reminderAt: new Date("2026-10-30T11:45:00.000Z"),
});

const makeNotification = (reminder: DueReminder): NotificationModel => ({
  id: `notification-${reminder.id}`,
  title: `Lembrete: ${reminder.activity}`,
  entity: "Anotação",
  idEntity: reminder.id,
  user_id: reminder.user_id,
  path: "/anotacoes",
  typeOfAction: "Lembrete",
  created_at: new Date("2026-10-30T11:45:00.000Z"),
});

const makeSut = () => {
  const reminderRepository = {
    findDue: jest.fn().mockResolvedValue([]),
    markAsSent: jest.fn().mockResolvedValue(undefined),
  } as jest.Mocked<ReminderRepositoryProtocol>;
  const notificationRepository = {
    create: jest.fn(),
    countNewByUserId: jest.fn().mockResolvedValue(1),
  } as unknown as jest.Mocked<NotificationRepositoryProtocol>;
  const sut = new ReminderProcessor(reminderRepository, notificationRepository);

  return { sut, reminderRepository, notificationRepository };
};

describe("ReminderProcessor", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("should persist and mark a due reminder as sent", async () => {
    const { sut, reminderRepository, notificationRepository } = makeSut();
    const reminder = makeReminder("reminder-1");
    reminderRepository.findDue.mockResolvedValueOnce([reminder]);
    notificationRepository.create.mockResolvedValueOnce(
      makeNotification(reminder)
    );

    await sut.processDue();

    expect(notificationRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        idEntity: reminder.id,
        userId: reminder.user_id,
        path: "/anotacoes",
        typeOfAction: "Lembrete",
      })
    );
    expect(reminderRepository.markAsSent).toHaveBeenCalledWith(
      reminder.id,
      expect.any(Date)
    );
    expect(notificationRepository.countNewByUserId).toHaveBeenCalledWith({
      userId: reminder.user_id,
    });
  });

  test("should continue processing after one reminder fails", async () => {
    const { sut, reminderRepository, notificationRepository } = makeSut();
    const firstReminder = makeReminder("reminder-1");
    const secondReminder = makeReminder("reminder-2");
    jest.spyOn(logger, "error").mockImplementation(() => logger);
    reminderRepository.findDue.mockResolvedValueOnce([
      firstReminder,
      secondReminder,
    ]);
    notificationRepository.create
      .mockRejectedValueOnce(new Error("Database error"))
      .mockResolvedValueOnce(makeNotification(secondReminder));

    await sut.processDue();

    expect(notificationRepository.create).toHaveBeenCalledTimes(2);
    expect(reminderRepository.markAsSent).toHaveBeenCalledTimes(1);
    expect(reminderRepository.markAsSent).toHaveBeenCalledWith(
      secondReminder.id,
      expect.any(Date)
    );
    expect(logger.error).toHaveBeenCalledWith(
      expect.stringContaining(firstReminder.id)
    );
  });

  test("should ignore an overlapping execution", async () => {
    const { sut, reminderRepository } = makeSut();
    let resolveSearch!: (reminders: DueReminder[]) => void;
    reminderRepository.findDue.mockReturnValueOnce(
      new Promise<DueReminder[]>((resolve) => {
        resolveSearch = resolve;
      })
    );

    const firstExecution = sut.processDue();
    const overlappingExecution = sut.processDue();
    await overlappingExecution;

    expect(reminderRepository.findDue).toHaveBeenCalledTimes(1);

    resolveSearch([]);
    await firstExecution;
  });

  test("should drain due reminders in batches after downtime", async () => {
    const { sut, reminderRepository, notificationRepository } = makeSut();
    const firstBatch = Array.from({ length: 100 }, (_, index) =>
      makeReminder(`reminder-${index + 1}`)
    );
    reminderRepository.findDue
      .mockResolvedValueOnce(firstBatch)
      .mockResolvedValueOnce([]);
    notificationRepository.create.mockImplementation(async (data) => ({
      id: `notification-${data.idEntity}`,
      title: data.title,
      entity: data.entity,
      idEntity: data.idEntity,
      user_id: data.userId,
      path: data.path,
      payload: data.payload,
      typeOfAction: data.typeOfAction,
      created_at: new Date(),
    }));

    await sut.processDue();

    expect(reminderRepository.findDue).toHaveBeenCalledTimes(2);
    expect(notificationRepository.create).toHaveBeenCalledTimes(100);
    expect(reminderRepository.markAsSent).toHaveBeenCalledTimes(100);
  });
});
