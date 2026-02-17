import { NotificationRepositoryProtocol } from "@/infra/db/interfaces/notificationRepositoryProtocol";
import { ServerError } from "@/data/errors/ServerError";
import { NotFoundError } from "@/data/errors/NotFoundError";
import { ValidationError } from "yup";
import { UpdateAllNewNotificationUseCase } from "@/data/usecases/notification/updateAllNewNotificationUseCase";
import { mockNotification } from "@/tests/unit/mocks/notification/mockNotification";

export const makeNotificationRepository =
  (): jest.Mocked<NotificationRepositoryProtocol> => ({
    updateAllNewToFalseByUserId: jest.fn().mockResolvedValue(null),
    ...({} as any),
  });

const makeSut = () => {
  const notificationRepositorySpy = makeNotificationRepository();
  const sut = new UpdateAllNewNotificationUseCase(notificationRepositorySpy);

  return {
    sut,
    notificationRepositorySpy,
  };
};

describe("UpdateAllNewNotificationUseCase", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should update all new notifications to false successfully", async () => {
    const { sut, notificationRepositorySpy } = makeSut();

    const input = {
      userId: mockNotification.user_id,
    };

    await sut.handle(input);

    expect(
      notificationRepositorySpy.updateAllNewToFalseByUserId
    ).toHaveBeenCalledWith(input);
    expect(
      notificationRepositorySpy.updateAllNewToFalseByUserId
    ).toHaveBeenCalledTimes(1);
  });

  test("should throw ValidationError if userId is empty", async () => {
    const { sut, notificationRepositorySpy } = makeSut();
    const input = {
      userId: "",
    };

    await expect(sut.handle(input)).rejects.toThrow(ValidationError);
    await expect(sut.handle(input)).rejects.toMatchObject({
      errors: expect.arrayContaining(["ID do Usuário é obrigatório"]),
    });
    expect(
      notificationRepositorySpy.updateAllNewToFalseByUserId
    ).not.toHaveBeenCalled();
  });

  test("should throw NotFoundError if no new notifications found", async () => {
    const { sut, notificationRepositorySpy } = makeSut();
    notificationRepositorySpy.updateAllNewToFalseByUserId.mockRejectedValue(
      new NotFoundError("Nenhuma notificação nova encontrada")
    );

    const input = {
      userId: mockNotification.user_id,
    };

    await expect(sut.handle(input)).rejects.toThrow(NotFoundError);
    await expect(sut.handle(input)).rejects.toMatchObject({
      message: "Nenhuma notificação nova encontrada",
    });
    expect(
      notificationRepositorySpy.updateAllNewToFalseByUserId
    ).toHaveBeenCalledWith(input);
    expect(
      notificationRepositorySpy.updateAllNewToFalseByUserId
    ).toHaveBeenCalledTimes(2);
  });

  test("should throw ServerError on unexpected error", async () => {
    const { sut, notificationRepositorySpy } = makeSut();
    notificationRepositorySpy.updateAllNewToFalseByUserId.mockRejectedValue(
      new Error("Database error")
    );

    const input = {
      userId: mockNotification.user_id,
    };

    await expect(sut.handle(input)).rejects.toThrow(
      new ServerError(
        "Falha na atualização de notificações novas: Database error"
      )
    );
    expect(
      notificationRepositorySpy.updateAllNewToFalseByUserId
    ).toHaveBeenCalledWith(input);
    expect(
      notificationRepositorySpy.updateAllNewToFalseByUserId
    ).toHaveBeenCalledTimes(1);
  });
});
