import { MonthlyRecordRepositoryProtocol } from "@/infra/db/interfaces/monthlyRecordRepositoryProtocol";
import { UserRepositoryProtocol } from "@/infra/db/interfaces/userRepositoryProtocol";
import { NotFoundError } from "@/data/errors/NotFoundError";
import { ServerError } from "@/data/errors/ServerError";
import { ValidationError } from "yup";
import { mockMonthlyRecord } from "@/tests/unit/mocks/monthlyRecord/mockMonthlyRecord";
import { DeleteMonthlyRecordUseCase } from "@/data/usecases/monthlyRecord/deleteMonthlyRecordyUseCase";
import { mockUser } from "@/tests/unit/mocks/user/mockUser";
import { NotificationRepositoryProtocol } from "@/infra/db/interfaces/notificationRepositoryProtocol";

export const makeMonthlyRecordRepository =
  (): jest.Mocked<MonthlyRecordRepositoryProtocol> => ({
    create: jest.fn(),
    findOneMonthlyRecord: jest.fn(),
    findByUserId: jest.fn(),
    findByIdAndUserId: jest.fn().mockResolvedValue(mockMonthlyRecord),
    update: jest.fn(),
    delete: jest.fn().mockResolvedValue(undefined),
    ...({} as any),
  });

export const makeUserRepository = (): jest.Mocked<UserRepositoryProtocol> => ({
  findOne: jest.fn().mockResolvedValue(mockUser),
  ...({} as any),
});

export const makeNotificationRepository =
  (): jest.Mocked<NotificationRepositoryProtocol> => ({
    create: jest.fn().mockResolvedValue(null),
    countNewByUserId: jest.fn().mockResolvedValue(0),
    ...({} as any),
  });

const makeSut = () => {
  const monthlyRecordRepositorySpy = makeMonthlyRecordRepository();
  const userRepositorySpy = makeUserRepository();
  const notificationRepositorySpy = makeNotificationRepository();

  const sut = new DeleteMonthlyRecordUseCase(
    monthlyRecordRepositorySpy,
    userRepositorySpy,
    notificationRepositorySpy
  );

  return {
    sut,
    monthlyRecordRepositorySpy,
    userRepositorySpy,
  };
};

describe("DeleteMonthlyRecordUseCase", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should delete a monthly record successfully", async () => {
    const { sut, monthlyRecordRepositorySpy, userRepositorySpy } = makeSut();
    userRepositorySpy.findOne.mockResolvedValue(mockUser);
    monthlyRecordRepositorySpy.findByIdAndUserId.mockResolvedValue(
      mockMonthlyRecord
    );
    monthlyRecordRepositorySpy.delete.mockResolvedValue(undefined);

    const input = {
      monthlyRecordId: mockMonthlyRecord.id,
      userId: mockMonthlyRecord.user_id,
    };

    await expect(sut.handle(input)).resolves.toBeUndefined();
    expect(userRepositorySpy.findOne).toHaveBeenCalledWith({
      id: input.userId,
    });
    expect(userRepositorySpy.findOne).toHaveBeenCalledTimes(1);
    expect(monthlyRecordRepositorySpy.findByIdAndUserId).toHaveBeenCalledWith({
      id: input.monthlyRecordId,
      userId: input.userId,
    });
    expect(monthlyRecordRepositorySpy.findByIdAndUserId).toHaveBeenCalledTimes(
      1
    );
    expect(monthlyRecordRepositorySpy.delete).toHaveBeenCalledWith({
      id: input.monthlyRecordId,
      userId: input.userId,
    });
    expect(monthlyRecordRepositorySpy.delete).toHaveBeenCalledTimes(1);
  });

  test("should throw ValidationError if id is empty", async () => {
    const { sut, monthlyRecordRepositorySpy, userRepositorySpy } = makeSut();
    const input = {
      monthlyRecordId: "",
      userId: mockMonthlyRecord.user_id,
    };

    await expect(sut.handle(input)).rejects.toThrow(ValidationError);
    await expect(sut.handle(input)).rejects.toMatchObject({
      errors: expect.arrayContaining(["ID do registro mensal é obrigatório"]),
    });
    expect(userRepositorySpy.findOne).not.toHaveBeenCalled();
    expect(monthlyRecordRepositorySpy.findByIdAndUserId).not.toHaveBeenCalled();
    expect(monthlyRecordRepositorySpy.delete).not.toHaveBeenCalled();
  });

  test("should throw ValidationError if userId is empty", async () => {
    const { sut, monthlyRecordRepositorySpy, userRepositorySpy } = makeSut();
    const input = {
      monthlyRecordId: mockMonthlyRecord.id,
      userId: "",
    };

    await expect(sut.handle(input)).rejects.toThrow(ValidationError);
    await expect(sut.handle(input)).rejects.toMatchObject({
      errors: expect.arrayContaining(["ID do Usuário é obrigatório"]),
    });
    expect(userRepositorySpy.findOne).not.toHaveBeenCalled();
    expect(monthlyRecordRepositorySpy.findByIdAndUserId).not.toHaveBeenCalled();
    expect(monthlyRecordRepositorySpy.delete).not.toHaveBeenCalled();
  });

  test("should throw NotFoundError if user does not exist", async () => {
    const { sut, monthlyRecordRepositorySpy, userRepositorySpy } = makeSut();
    userRepositorySpy.findOne.mockResolvedValue(null);

    const input = {
      monthlyRecordId: mockMonthlyRecord.id,
      userId: mockMonthlyRecord.user_id,
    };

    await expect(sut.handle(input)).rejects.toThrow(
      new NotFoundError(`Usuário com ID ${input.userId} não encontrado`)
    );
    expect(userRepositorySpy.findOne).toHaveBeenCalledWith({
      id: input.userId,
    });
    expect(userRepositorySpy.findOne).toHaveBeenCalledTimes(1);
    expect(monthlyRecordRepositorySpy.findByIdAndUserId).not.toHaveBeenCalled();
    expect(monthlyRecordRepositorySpy.delete).not.toHaveBeenCalled();
  });

  test("should throw NotFoundError if monthly record does not exist", async () => {
    const { sut, monthlyRecordRepositorySpy, userRepositorySpy } = makeSut();
    userRepositorySpy.findOne.mockResolvedValue(mockUser);
    monthlyRecordRepositorySpy.findByIdAndUserId.mockResolvedValue(null);

    const input = {
      monthlyRecordId: mockMonthlyRecord.id,
      userId: mockMonthlyRecord.user_id,
    };

    await expect(sut.handle(input)).rejects.toThrow(
      new NotFoundError(
        `Registro mensal com ID ${input.monthlyRecordId} não encontrado para este usuário`
      )
    );
    expect(userRepositorySpy.findOne).toHaveBeenCalledWith({
      id: input.userId,
    });
    expect(userRepositorySpy.findOne).toHaveBeenCalledTimes(1);
    expect(monthlyRecordRepositorySpy.findByIdAndUserId).toHaveBeenCalledWith({
      id: input.monthlyRecordId,
      userId: input.userId,
    });
    expect(monthlyRecordRepositorySpy.findByIdAndUserId).toHaveBeenCalledTimes(
      1
    );
    expect(monthlyRecordRepositorySpy.delete).not.toHaveBeenCalled();
  });

  test("should throw ServerError on unexpected error", async () => {
    const { sut, monthlyRecordRepositorySpy, userRepositorySpy } = makeSut();
    userRepositorySpy.findOne.mockResolvedValue(mockUser);
    monthlyRecordRepositorySpy.findByIdAndUserId.mockResolvedValue(
      mockMonthlyRecord
    );
    monthlyRecordRepositorySpy.delete.mockRejectedValue(
      new Error("Database error")
    );

    const input = {
      monthlyRecordId: mockMonthlyRecord.id,
      userId: mockMonthlyRecord.user_id,
    };

    await expect(sut.handle(input)).rejects.toThrow(
      new ServerError("Falha ao deletar o registro mensal: Database error")
    );
    expect(userRepositorySpy.findOne).toHaveBeenCalledWith({
      id: input.userId,
    });
    expect(userRepositorySpy.findOne).toHaveBeenCalledTimes(1);
    expect(monthlyRecordRepositorySpy.findByIdAndUserId).toHaveBeenCalledWith({
      id: input.monthlyRecordId,
      userId: input.userId,
    });
    expect(monthlyRecordRepositorySpy.findByIdAndUserId).toHaveBeenCalledTimes(
      1
    );
    expect(monthlyRecordRepositorySpy.delete).toHaveBeenCalledWith({
      id: input.monthlyRecordId,
      userId: input.userId,
    });
    expect(monthlyRecordRepositorySpy.delete).toHaveBeenCalledTimes(1);
  });
});
