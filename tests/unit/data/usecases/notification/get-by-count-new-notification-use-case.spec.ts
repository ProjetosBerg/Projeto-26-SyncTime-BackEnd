import { NotificationRepositoryProtocol } from "@/infra/db/interfaces/notificationRepositoryProtocol";
import { ServerError } from "@/data/errors/ServerError";
import { ValidationError } from "yup";
import { GetCountNewNotificationUseCase } from "@/data/usecases/notification/getCountNewNotificationUseCase";
import { mockNotification } from "@/tests/unit/mocks/notification/mockNotification";

export const makeNotificationRepository =
  (): jest.Mocked<NotificationRepositoryProtocol> => ({
    countNewByUserId: jest.fn().mockResolvedValue(5),
    ...({} as any),
  });

const makeSut = () => {
  const notificationRepositorySpy = makeNotificationRepository();
  const sut = new GetCountNewNotificationUseCase(notificationRepositorySpy);

  return {
    sut,
    notificationRepositorySpy,
  };
};

describe("GetCountNewNotificationUseCase", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should get count of new notifications successfully", async () => {
    const { sut, notificationRepositorySpy } = makeSut();
    const mockCount = 3;

    notificationRepositorySpy.countNewByUserId.mockResolvedValue(mockCount);

    const input = {
      userId: mockNotification.user_id,
    };

    const result = await sut.handle(input);

    expect(result).toBe(mockCount);
    expect(notificationRepositorySpy.countNewByUserId).toHaveBeenCalledWith(
      input
    );
    expect(notificationRepositorySpy.countNewByUserId).toHaveBeenCalledTimes(1);
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
    expect(notificationRepositorySpy.countNewByUserId).not.toHaveBeenCalled();
  });

  test("should throw ServerError on unexpected error", async () => {
    const { sut, notificationRepositorySpy } = makeSut();
    notificationRepositorySpy.countNewByUserId.mockRejectedValue(
      new Error("Database error")
    );

    const input = {
      userId: mockNotification.user_id,
    };

    await expect(sut.handle(input)).rejects.toThrow(
      new ServerError("Falha na contagem de notificações novas: Database error")
    );
    expect(notificationRepositorySpy.countNewByUserId).toHaveBeenCalledWith(
      input
    );
    expect(notificationRepositorySpy.countNewByUserId).toHaveBeenCalledTimes(1);
  });
});
