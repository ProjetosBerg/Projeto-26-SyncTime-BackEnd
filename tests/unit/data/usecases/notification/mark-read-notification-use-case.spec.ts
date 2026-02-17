import { NotificationRepositoryProtocol } from "@/infra/db/interfaces/notificationRepositoryProtocol";
import { ServerError } from "@/data/errors/ServerError";
import { NotFoundError } from "@/data/errors/NotFoundError";
import { ValidationError } from "yup";
import { MarkReadNotificationUseCase } from "@/data/usecases/notification/markReadNotificationUseCase";
import { mockNotification } from "@/tests/unit/mocks/notification/mockNotification";
import { faker } from "@faker-js/faker";

export const makeNotificationRepository =
  (): jest.Mocked<NotificationRepositoryProtocol> => ({
    markAsReadNotifications: jest.fn().mockResolvedValue(null),
    ...({} as any),
  });

const makeSut = () => {
  const notificationRepositorySpy = makeNotificationRepository();
  const sut = new MarkReadNotificationUseCase(notificationRepositorySpy);

  return {
    sut,
    notificationRepositorySpy,
  };
};

describe("MarkReadNotificationUseCase", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should mark notifications as read successfully", async () => {
    const { sut, notificationRepositorySpy } = makeSut();
    const mockIds = [mockNotification.id];

    await sut.handle({
      userId: mockNotification.user_id,
      ids: mockIds,
    });

    expect(
      notificationRepositorySpy.markAsReadNotifications
    ).toHaveBeenCalledWith({
      userId: mockNotification.user_id,
      ids: mockIds,
    });
    expect(
      notificationRepositorySpy.markAsReadNotifications
    ).toHaveBeenCalledTimes(1);
  });

  test("should mark multiple notifications as read successfully", async () => {
    const { sut, notificationRepositorySpy } = makeSut();
    const mockIds = [mockNotification.id, faker.datatype.uuid()];

    await sut.handle({
      userId: mockNotification.user_id,
      ids: mockIds,
    });

    expect(
      notificationRepositorySpy.markAsReadNotifications
    ).toHaveBeenCalledWith({
      userId: mockNotification.user_id,
      ids: mockIds,
    });
    expect(
      notificationRepositorySpy.markAsReadNotifications
    ).toHaveBeenCalledTimes(1);
  });

  test("should throw ValidationError if userId is empty", async () => {
    const { sut, notificationRepositorySpy } = makeSut();
    const input = {
      userId: "",
      ids: [mockNotification.id],
    };

    await expect(sut.handle(input)).rejects.toThrow(ValidationError);
    await expect(sut.handle(input)).rejects.toMatchObject({
      errors: expect.arrayContaining(["ID do Usuário é obrigatório"]),
    });
    expect(
      notificationRepositorySpy.markAsReadNotifications
    ).not.toHaveBeenCalled();
  });

  test("should throw ValidationError if ids is empty", async () => {
    const { sut, notificationRepositorySpy } = makeSut();
    const input = {
      userId: mockNotification.user_id,
      ids: [],
    };

    await expect(sut.handle(input)).rejects.toThrow(ValidationError);
    await expect(sut.handle(input)).rejects.toMatchObject({
      errors: expect.arrayContaining([
        "Pelo menos um ID de notificação deve ser fornecido",
      ]),
    });
    expect(
      notificationRepositorySpy.markAsReadNotifications
    ).not.toHaveBeenCalled();
  });

  test("should throw ValidationError if ids is too long", async () => {
    const { sut, notificationRepositorySpy } = makeSut();
    const longIds = Array.from({ length: 101 }, (_, i) => `id-${i}`);
    const input = {
      userId: mockNotification.user_id,
      ids: longIds,
    };

    await expect(sut.handle(input)).rejects.toThrow(ValidationError);
    await expect(sut.handle(input)).rejects.toMatchObject({
      errors: expect.arrayContaining([
        "Máximo de 100 notificações podem ser marcadas por vez",
      ]),
    });
    expect(
      notificationRepositorySpy.markAsReadNotifications
    ).not.toHaveBeenCalled();
  });

  test("should throw ValidationError if id is invalid UUID", async () => {
    const { sut, notificationRepositorySpy } = makeSut();
    const input = {
      userId: mockNotification.user_id,
      ids: ["invalid-id"],
    };

    await expect(sut.handle(input)).rejects.toThrow(ValidationError);
    await expect(sut.handle(input)).rejects.toMatchObject({
      errors: expect.arrayContaining([
        expect.stringContaining("ID da notificação deve ser um UUID válido"),
      ]),
    });
    expect(
      notificationRepositorySpy.markAsReadNotifications
    ).not.toHaveBeenCalled();
  });

  test("should throw NotFoundError if no notifications found", async () => {
    const { sut, notificationRepositorySpy } = makeSut();
    notificationRepositorySpy.markAsReadNotifications.mockRejectedValue(
      new NotFoundError("Nenhuma notificação encontrada")
    );

    const input = {
      userId: mockNotification.user_id,
      ids: [mockNotification.id],
    };

    await expect(sut.handle(input)).rejects.toThrow(NotFoundError);
    await expect(sut.handle(input)).rejects.toMatchObject({
      message: "Nenhuma notificação encontrada",
    });
    expect(
      notificationRepositorySpy.markAsReadNotifications
    ).toHaveBeenCalledWith(input);
    expect(
      notificationRepositorySpy.markAsReadNotifications
    ).toHaveBeenCalledTimes(2);
  });

  test("should throw ServerError on unexpected error", async () => {
    const { sut, notificationRepositorySpy } = makeSut();
    notificationRepositorySpy.markAsReadNotifications.mockRejectedValue(
      new Error("Database error")
    );

    const input = {
      userId: mockNotification.user_id,
      ids: [mockNotification.id],
    };

    await expect(sut.handle(input)).rejects.toThrow(
      new ServerError(
        "Falha na marcação de notificações como lidas: Database error"
      )
    );
    expect(
      notificationRepositorySpy.markAsReadNotifications
    ).toHaveBeenCalledWith(input);
    expect(
      notificationRepositorySpy.markAsReadNotifications
    ).toHaveBeenCalledTimes(1);
  });
});
