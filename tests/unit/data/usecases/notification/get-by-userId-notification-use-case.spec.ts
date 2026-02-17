import { NotificationRepositoryProtocol } from "@/infra/db/interfaces/notificationRepositoryProtocol";
import { ServerError } from "@/data/errors/ServerError";
import { ValidationError } from "yup";
import { GetByUserIdNotificationUseCase } from "@/data/usecases/notification/getByUserIdNotificationUseCase";
import { mockNotification } from "@/tests/unit/mocks/notification/mockNotification";

export const makeNotificationRepository =
  (): jest.Mocked<NotificationRepositoryProtocol> => ({
    findByUserId: jest.fn().mockResolvedValue({ notifications: [], total: 0 }),
    ...({} as any),
  });

const makeSut = () => {
  const notificationRepositorySpy = makeNotificationRepository();
  const sut = new GetByUserIdNotificationUseCase(notificationRepositorySpy);

  return {
    sut,
    notificationRepositorySpy,
  };
};

describe("GetByUserIdNotificationUseCase", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should get notifications successfully", async () => {
    const { sut, notificationRepositorySpy } = makeSut();
    const mockNotificationsList = [{ ...mockNotification }];
    const mockTotal = 1;
    notificationRepositorySpy.findByUserId.mockResolvedValue({
      notifications: mockNotificationsList,
      total: mockTotal,
    });

    const input = {
      userId: mockNotification.user_id,
      page: 1,
      limit: 10,
      search: "",
      sortBy: "created_at",
      order: "ASC",
      isRead: false,
      typeOfAction: "like",
    };

    const result = await sut.handle(input);

    expect(result).toEqual({
      notifications: mockNotificationsList,
      total: mockTotal,
    });
    expect(notificationRepositorySpy.findByUserId).toHaveBeenCalledWith(input);
    expect(notificationRepositorySpy.findByUserId).toHaveBeenCalledTimes(1);
  });

  test("should get notifications successfully with defaults", async () => {
    const { sut, notificationRepositorySpy } = makeSut();
    const mockNotificationsList = [{ ...mockNotification }];
    const mockTotal = 1;
    notificationRepositorySpy.findByUserId.mockResolvedValue({
      notifications: mockNotificationsList,
      total: mockTotal,
    });

    const input = {
      userId: mockNotification.user_id,
    };

    const result = await sut.handle(input);

    expect(result).toEqual({
      notifications: mockNotificationsList,
      total: mockTotal,
    });
    expect(notificationRepositorySpy.findByUserId).toHaveBeenCalledWith({
      userId: input.userId,
      page: 1,
      limit: 10,
      search: "",
      sortBy: "created_at",
      order: "ASC",
      isRead: undefined,
      typeOfAction: undefined,
    });
    expect(notificationRepositorySpy.findByUserId).toHaveBeenCalledTimes(1);
  });

  test("should throw ValidationError if userId is empty", async () => {
    const { sut, notificationRepositorySpy } = makeSut();
    const input = {
      userId: "",
      page: 1,
      limit: 10,
    };

    await expect(sut.handle(input)).rejects.toThrow(ValidationError);
    await expect(sut.handle(input)).rejects.toMatchObject({
      errors: expect.arrayContaining(["ID do Usuário é obrigatório"]),
    });
    expect(notificationRepositorySpy.findByUserId).not.toHaveBeenCalled();
  });

  test("should throw ValidationError if page is invalid", async () => {
    const { sut, notificationRepositorySpy } = makeSut();
    const input = {
      userId: mockNotification.user_id,
      page: 0,
      limit: 10,
    };

    await expect(sut.handle(input)).rejects.toThrow(ValidationError);
    await expect(sut.handle(input)).rejects.toMatchObject({
      errors: expect.arrayContaining(["Página deve ser maior que 0"]),
    });
    expect(notificationRepositorySpy.findByUserId).not.toHaveBeenCalled();
  });

  test("should throw ValidationError if search is too long", async () => {
    const { sut, notificationRepositorySpy } = makeSut();
    const longSearch = "a".repeat(101);
    const input = {
      userId: mockNotification.user_id,
      page: 1,
      limit: 10,
      search: longSearch,
    };

    await expect(sut.handle(input)).rejects.toThrow(ValidationError);
    await expect(sut.handle(input)).rejects.toMatchObject({
      errors: expect.arrayContaining([
        "Busca deve ter no máximo 100 caracteres",
      ]),
    });
    expect(notificationRepositorySpy.findByUserId).not.toHaveBeenCalled();
  });

  test("should throw ValidationError if order is invalid", async () => {
    const { sut, notificationRepositorySpy } = makeSut();
    const input = {
      userId: mockNotification.user_id,
      page: 1,
      limit: 10,
      order: "INVALID",
    };

    await expect(sut.handle(input)).rejects.toThrow(ValidationError);
    await expect(sut.handle(input)).rejects.toMatchObject({
      errors: expect.arrayContaining(["Ordem deve ser ASC ou DESC"]),
    });
    expect(notificationRepositorySpy.findByUserId).not.toHaveBeenCalled();
  });

  test("should throw ValidationError if typeOfAction is too long", async () => {
    const { sut, notificationRepositorySpy } = makeSut();
    const longTypeOfAction = "a".repeat(51);
    const input = {
      userId: mockNotification.user_id,
      page: 1,
      limit: 10,
      typeOfAction: longTypeOfAction,
    };

    await expect(sut.handle(input)).rejects.toThrow(ValidationError);
    await expect(sut.handle(input)).rejects.toMatchObject({
      errors: expect.arrayContaining([
        "Tipo de ação deve ter no máximo 50 caracteres",
      ]),
    });
    expect(notificationRepositorySpy.findByUserId).not.toHaveBeenCalled();
  });

  test("should throw ServerError on unexpected error", async () => {
    const { sut, notificationRepositorySpy } = makeSut();
    notificationRepositorySpy.findByUserId.mockRejectedValue(
      new Error("Database error")
    );

    const input = {
      userId: mockNotification.user_id,
      page: 1,
      limit: 10,
    };

    await expect(sut.handle(input)).rejects.toThrow(
      new ServerError("Falha na busca de notificações: Database error")
    );
    expect(notificationRepositorySpy.findByUserId).toHaveBeenCalledWith({
      userId: input.userId,
      page: input.page,
      limit: input.limit,
      search: "",
      sortBy: "created_at",
      order: "ASC",
      isRead: undefined,
      typeOfAction: undefined,
    });
    expect(notificationRepositorySpy.findByUserId).toHaveBeenCalledTimes(1);
  });
});
