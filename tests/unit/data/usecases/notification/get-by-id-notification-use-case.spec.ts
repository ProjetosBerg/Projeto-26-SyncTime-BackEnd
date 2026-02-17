import { NotificationRepositoryProtocol } from "@/infra/db/interfaces/notificationRepositoryProtocol";
import { ServerError } from "@/data/errors/ServerError";
import { NotFoundError } from "@/data/errors/NotFoundError";
import { ValidationError } from "yup";
import { GetByIdNotificationUseCase } from "@/data/usecases/notification/getByIdNotificationUseCase";
import { mockNotification } from "@/tests/unit/mocks/notification/mockNotification";

export const makeNotificationRepository =
  (): jest.Mocked<NotificationRepositoryProtocol> => ({
    findByIdAndUserId: jest.fn().mockResolvedValue(mockNotification),
    ...({} as any),
  });

const makeSut = () => {
  const notificationRepositorySpy = makeNotificationRepository();
  const sut = new GetByIdNotificationUseCase(notificationRepositorySpy);

  return {
    sut,
    notificationRepositorySpy,
  };
};

describe("GetByIdNotificationUseCase", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should get notification successfully", async () => {
    const { sut, notificationRepositorySpy } = makeSut();

    const input = {
      userId: mockNotification.user_id,
      id: mockNotification.id,
    };

    const result = await sut.handle(input);

    expect(result).toEqual(mockNotification);
    expect(notificationRepositorySpy.findByIdAndUserId).toHaveBeenCalledWith(
      input
    );
    expect(notificationRepositorySpy.findByIdAndUserId).toHaveBeenCalledTimes(
      1
    );
  });

  test("should throw NotFoundError if notification is not found", async () => {
    const { sut, notificationRepositorySpy } = makeSut();
    notificationRepositorySpy.findByIdAndUserId.mockResolvedValue(null);

    const input = {
      userId: mockNotification.user_id,
      id: mockNotification.id,
    };

    await expect(sut.handle(input)).rejects.toThrow(NotFoundError);
    await expect(sut.handle(input)).rejects.toMatchObject({
      message: expect.stringContaining("não encontrada"),
    });
    expect(notificationRepositorySpy.findByIdAndUserId).toHaveBeenCalledWith(
      input
    );
    expect(notificationRepositorySpy.findByIdAndUserId).toHaveBeenCalledTimes(
      2
    );
  });

  test("should throw ValidationError if userId is empty", async () => {
    const { sut, notificationRepositorySpy } = makeSut();
    const input = {
      userId: "",
      id: mockNotification.id,
    };

    await expect(sut.handle(input)).rejects.toThrow(ValidationError);
    await expect(sut.handle(input)).rejects.toMatchObject({
      errors: expect.arrayContaining(["ID do Usuário é obrigatório"]),
    });
    expect(notificationRepositorySpy.findByIdAndUserId).not.toHaveBeenCalled();
  });

  test("should throw ValidationError if id is empty", async () => {
    const { sut, notificationRepositorySpy } = makeSut();
    const input = {
      userId: mockNotification.user_id,
      id: "",
    };

    await expect(sut.handle(input)).rejects.toThrow(ValidationError);
    await expect(sut.handle(input)).rejects.toMatchObject({
      errors: expect.arrayContaining(["ID da notificação é obrigatório"]),
    });
    expect(notificationRepositorySpy.findByIdAndUserId).not.toHaveBeenCalled();
  });

  test("should throw ValidationError if id is invalid UUID", async () => {
    const { sut, notificationRepositorySpy } = makeSut();
    const input = {
      userId: mockNotification.user_id,
      id: "invalid-id",
    };

    await expect(sut.handle(input)).rejects.toThrow(ValidationError);
    await expect(sut.handle(input)).rejects.toMatchObject({
      errors: expect.arrayContaining([
        "ID da notificação deve ser um UUID válido",
      ]),
    });
    expect(notificationRepositorySpy.findByIdAndUserId).not.toHaveBeenCalled();
  });

  test("should throw ServerError on unexpected error", async () => {
    const { sut, notificationRepositorySpy } = makeSut();
    notificationRepositorySpy.findByIdAndUserId.mockRejectedValue(
      new Error("Database error")
    );

    const input = {
      userId: mockNotification.user_id,
      id: mockNotification.id,
    };

    await expect(sut.handle(input)).rejects.toThrow(
      new ServerError("Falha na busca de notificação: Database error")
    );
    expect(notificationRepositorySpy.findByIdAndUserId).toHaveBeenCalledWith(
      input
    );
    expect(notificationRepositorySpy.findByIdAndUserId).toHaveBeenCalledTimes(
      1
    );
  });
});
