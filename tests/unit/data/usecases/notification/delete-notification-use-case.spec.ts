import { NotificationRepositoryProtocol } from "@/infra/db/interfaces/notificationRepositoryProtocol";
import { ServerError } from "@/data/errors/ServerError";
import { ValidationError } from "yup";
import { DeleteNotificationUseCase } from "@/data/usecases/notification/deleteNotificationUseCase";
import { mockNotification } from "@/tests/unit/mocks/notification/mockNotification";
import { faker } from "@faker-js/faker";

export const makeNotificationRepository =
  (): jest.Mocked<NotificationRepositoryProtocol> => ({
    deleteNotifications: jest.fn().mockResolvedValue(null),
    ...({} as any),
  });

const makeSut = () => {
  const notificationRepositorySpy = makeNotificationRepository();
  const sut = new DeleteNotificationUseCase(notificationRepositorySpy);

  return {
    sut,
    notificationRepositorySpy,
  };
};

describe("DeleteNotificationUseCase", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should delete notifications successfully", async () => {
    const { sut, notificationRepositorySpy } = makeSut();
    const mockIds = [mockNotification.id];

    await sut.handle({
      userId: String(mockNotification.user_id),
      ids: mockIds as string[],
    });

    expect(notificationRepositorySpy.deleteNotifications).toHaveBeenCalledWith({
      userId: mockNotification.user_id,
      ids: mockIds,
    });
    expect(notificationRepositorySpy.deleteNotifications).toHaveBeenCalledTimes(
      1
    );
  });

  test("should delete multiple notifications successfully", async () => {
    const { sut, notificationRepositorySpy } = makeSut();
    const mockIds = [mockNotification.id, faker.datatype.uuid()];

    await sut.handle({
      userId: mockNotification.user_id as string,
      ids: mockIds as string[],
    });

    expect(notificationRepositorySpy.deleteNotifications).toHaveBeenCalledWith({
      userId: mockNotification.user_id,
      ids: mockIds,
    });
    expect(notificationRepositorySpy.deleteNotifications).toHaveBeenCalledTimes(
      1
    );
  });

  test("should throw ValidationError if userId is empty", async () => {
    const { sut, notificationRepositorySpy } = makeSut();
    const input = {
      userId: "",
      ids: [mockNotification.id] as string[],
    };

    await expect(sut.handle(input)).rejects.toThrow(ValidationError);
    await expect(sut.handle(input)).rejects.toMatchObject({
      errors: expect.arrayContaining(["ID do Usuário é obrigatório"]),
    });
    expect(
      notificationRepositorySpy.deleteNotifications
    ).not.toHaveBeenCalled();
  });

  test("should throw ValidationError if ids is empty", async () => {
    const { sut, notificationRepositorySpy } = makeSut();
    const input = {
      userId: mockNotification.user_id as string,
      ids: [],
    };

    await expect(sut.handle(input)).rejects.toThrow(ValidationError);
    await expect(sut.handle(input)).rejects.toMatchObject({
      errors: expect.arrayContaining([
        "Pelo menos um ID de notificação deve ser fornecido",
      ]),
    });
    expect(
      notificationRepositorySpy.deleteNotifications
    ).not.toHaveBeenCalled();
  });

  test("should throw ValidationError if ids is too long", async () => {
    const { sut, notificationRepositorySpy } = makeSut();
    const longIds = Array.from({ length: 101 }, (_, i) => `id-${i}`);
    const input = {
      userId: mockNotification.user_id as string,
      ids: longIds as string[],
    };

    await expect(sut.handle(input)).rejects.toThrow(ValidationError);
    await expect(sut.handle(input)).rejects.toMatchObject({
      errors: expect.arrayContaining([
        "Máximo de 100 notificações podem ser deletadas por vez",
      ]),
    });
    expect(
      notificationRepositorySpy.deleteNotifications
    ).not.toHaveBeenCalled();
  });

  test("should throw ValidationError if id is invalid UUID", async () => {
    const { sut, notificationRepositorySpy } = makeSut();
    const input = {
      userId: mockNotification.user_id as string,
      ids: ["invalid-id"] as string[],
    };

    await expect(sut.handle(input)).rejects.toThrow(ValidationError);
    await expect(sut.handle(input)).rejects.toMatchObject({
      errors: expect.arrayContaining([
        expect.stringContaining("ID da notificação deve ser um UUID válido"),
      ]),
    });
    expect(
      notificationRepositorySpy.deleteNotifications
    ).not.toHaveBeenCalled();
  });

  test("should throw ServerError on unexpected error", async () => {
    const { sut, notificationRepositorySpy } = makeSut();
    notificationRepositorySpy.deleteNotifications.mockRejectedValue(
      new Error("Database error")
    );

    const input = {
      userId: mockNotification.user_id as string,
      ids: [mockNotification.id] as string[],
    };

    await expect(sut.handle(input)).rejects.toThrow(
      new ServerError("Falha na deleção de notificações: Database error")
    );
    expect(notificationRepositorySpy.deleteNotifications).toHaveBeenCalledWith(
      input
    );
    expect(notificationRepositorySpy.deleteNotifications).toHaveBeenCalledTimes(
      1
    );
  });
});
