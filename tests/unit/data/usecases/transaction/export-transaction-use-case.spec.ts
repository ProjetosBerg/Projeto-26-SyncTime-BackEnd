import { UserRepositoryProtocol } from "@/infra/db/interfaces/userRepositoryProtocol";
import { MonthlyRecordRepositoryProtocol } from "@/infra/db/interfaces/monthlyRecordRepositoryProtocol";
import { NotFoundError } from "@/data/errors/NotFoundError";
import { ServerError } from "@/data/errors/ServerError";
import { ValidationError } from "yup";
import { mockMonthlyRecord } from "@/tests/unit/mocks/monthlyRecord/mockMonthlyRecord";
import { mockUser } from "@/tests/unit/mocks/user/mockUser";
import { GetByUserIdTransactionUseCaseProtocol } from "@/data/usecases/interfaces/transactions/getByUserIdTransactionUseCaseProtocol";
import { ExportTransactionUseCase } from "@/data/usecases/transactions/exportTransactionUseCase";
import { GenericExportUseCaseProtocol } from "@/data/usecases/interfaces/export/genericExportUseCaseProtocol";
import { Readable } from "stream";
import { mockTransaction } from "@/tests/unit/mocks/transaction/mockTransaction";
import { NotificationRepositoryProtocol } from "@/infra/db/interfaces/notificationRepositoryProtocol";

const mockEnrichedTransaction = {
  transaction: mockTransaction,
  customFields: [],
  recordTypeId: 1,
} as any;

export const makeUserRepository = (): jest.Mocked<UserRepositoryProtocol> => ({
  findOne: jest.fn().mockResolvedValue(mockUser),
  ...({} as any),
});

export const makeMonthlyRecordRepository =
  (): jest.Mocked<MonthlyRecordRepositoryProtocol> => ({
    create: jest.fn(),
    findOneMonthlyRecord: jest.fn(),
    findByUserId: jest.fn(),
    findByIdAndUserId: jest.fn().mockResolvedValue(mockMonthlyRecord),
    update: jest.fn(),
    delete: jest.fn(),
    ...({} as any),
  });

export const makeGetByUserIdTransactionUseCase =
  (): jest.Mocked<GetByUserIdTransactionUseCaseProtocol> => ({
    handle: jest
      .fn()
      .mockResolvedValue({
        transactions: [mockEnrichedTransaction],
        totalAmount: mockTransaction.amount,
      }),
    ...({} as any),
  });

export const makeGenericExportUseCase =
  (): jest.Mocked<GenericExportUseCaseProtocol> => ({
    handle: jest.fn(),
    ...({} as any),
  });

export const makeNotificationRepository =
  (): jest.Mocked<NotificationRepositoryProtocol> => ({
    create: jest.fn().mockResolvedValue(null),
    countNewByUserId: jest.fn().mockResolvedValue(0),
    ...({} as any),
  });

const makeSut = () => {
  const userRepositorySpy = makeUserRepository();
  const monthlyRecordRepositorySpy = makeMonthlyRecordRepository();
  const getByUserIdTransactionUseCaseSpy = makeGetByUserIdTransactionUseCase();
  const genericExportUseCaseSpy = makeGenericExportUseCase();
  const notificationRepositorySpy = makeNotificationRepository();
  const sut = new ExportTransactionUseCase(
    getByUserIdTransactionUseCaseSpy,
    userRepositorySpy,
    monthlyRecordRepositorySpy,
    genericExportUseCaseSpy,
    notificationRepositorySpy
  );

  return {
    sut,
    userRepositorySpy,
    monthlyRecordRepositorySpy,
    getByUserIdTransactionUseCaseSpy,
    genericExportUseCaseSpy,
  };
};

describe("ExportTransactionUseCase", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should export transactions successfully", async () => {
    const {
      sut,
      userRepositorySpy,
      monthlyRecordRepositorySpy,
      getByUserIdTransactionUseCaseSpy,
      genericExportUseCaseSpy,
    } = makeSut();
    const mockStream = new Readable();
    genericExportUseCaseSpy.handle.mockResolvedValue(mockStream);

    const input = {
      userId: mockUser.id,
      monthlyRecordId: mockMonthlyRecord.id,
      format: "csv" as any,
    };

    const result = await sut.handle(input);

    expect(result).toBe(mockStream);
    expect(userRepositorySpy.findOne).toHaveBeenCalledWith({
      id: input.userId,
    });
    expect(userRepositorySpy.findOne).toHaveBeenCalledTimes(1);
    expect(monthlyRecordRepositorySpy.findByIdAndUserId).toHaveBeenCalledWith({
      id: String(input.monthlyRecordId),
      userId: input.userId,
    });
    expect(monthlyRecordRepositorySpy.findByIdAndUserId).toHaveBeenCalledTimes(
      1
    );
    expect(getByUserIdTransactionUseCaseSpy.handle).toHaveBeenCalledWith({
      userId: input.userId,
      monthlyRecordId: input.monthlyRecordId,
    });
    expect(getByUserIdTransactionUseCaseSpy.handle).toHaveBeenCalledTimes(1);
    expect(genericExportUseCaseSpy.handle).toHaveBeenCalledTimes(1);
    expect(genericExportUseCaseSpy.handle).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.any(Array),
        headers: expect.any(Array),
        format: input.format,
        metadata: expect.any(Object),
      })
    );
  });

  test("should throw ServerError if no transactions are found", async () => {
    const {
      sut,
      userRepositorySpy,
      monthlyRecordRepositorySpy,
      getByUserIdTransactionUseCaseSpy,
      genericExportUseCaseSpy,
    } = makeSut();
    getByUserIdTransactionUseCaseSpy.handle.mockResolvedValue({
      transactions: [],
      totalAmount: 0,
    });

    const input = {
      userId: mockUser.id,
      monthlyRecordId: mockMonthlyRecord.id,
      format: "csv" as any,
    };

    await expect(sut.handle(input)).rejects.toThrow(
      new ServerError(
        "Falha na exportação das transações: Nenhuma transação encontrada para exportar."
      )
    );
    expect(userRepositorySpy.findOne).toHaveBeenCalledWith({
      id: input.userId,
    });
    expect(userRepositorySpy.findOne).toHaveBeenCalledTimes(1);
    expect(monthlyRecordRepositorySpy.findByIdAndUserId).toHaveBeenCalledWith({
      id: String(input.monthlyRecordId),
      userId: input.userId,
    });
    expect(monthlyRecordRepositorySpy.findByIdAndUserId).toHaveBeenCalledTimes(
      1
    );
    expect(getByUserIdTransactionUseCaseSpy.handle).toHaveBeenCalledWith({
      userId: input.userId,
      monthlyRecordId: input.monthlyRecordId,
    });
    expect(getByUserIdTransactionUseCaseSpy.handle).toHaveBeenCalledTimes(1);
    expect(genericExportUseCaseSpy.handle).not.toHaveBeenCalled();
  });

  test("should throw ServerError if invalid format", async () => {
    const {
      sut,
      userRepositorySpy,
      monthlyRecordRepositorySpy,
      getByUserIdTransactionUseCaseSpy,
    } = makeSut();

    const input = {
      userId: mockUser.id,
      monthlyRecordId: mockMonthlyRecord.id,
      format: "txt" as any,
    };

    await expect(sut.handle(input)).rejects.toThrow(
      new ServerError(
        "Falha na exportação das transações: Formato de exportação inválido."
      )
    );
    expect(userRepositorySpy.findOne).not.toHaveBeenCalled();
    expect(monthlyRecordRepositorySpy.findByIdAndUserId).not.toHaveBeenCalled();
    expect(getByUserIdTransactionUseCaseSpy.handle).not.toHaveBeenCalled();
  });

  test("should throw ValidationError if userId is empty", async () => {
    const {
      sut,
      userRepositorySpy,
      monthlyRecordRepositorySpy,
      getByUserIdTransactionUseCaseSpy,
    } = makeSut();

    const input = {
      userId: "",
      monthlyRecordId: mockMonthlyRecord.id,
      format: "csv" as any,
    };

    await expect(sut.handle(input)).rejects.toThrow(ValidationError);
    await expect(sut.handle(input)).rejects.toMatchObject({
      errors: expect.arrayContaining(["ID do Usuário é obrigatório"]),
    });
    expect(userRepositorySpy.findOne).not.toHaveBeenCalled();
    expect(monthlyRecordRepositorySpy.findByIdAndUserId).not.toHaveBeenCalled();
    expect(getByUserIdTransactionUseCaseSpy.handle).not.toHaveBeenCalled();
  });

  test("should throw ValidationError if monthlyRecordId is empty", async () => {
    const {
      sut,
      userRepositorySpy,
      monthlyRecordRepositorySpy,
      getByUserIdTransactionUseCaseSpy,
    } = makeSut();

    const input = {
      userId: mockUser.id,
      monthlyRecordId: "",
      format: "csv" as any,
    };

    await expect(sut.handle(input)).rejects.toThrow(ValidationError);
    await expect(sut.handle(input)).rejects.toMatchObject({
      errors: expect.arrayContaining(["Registro mensal é obrigatório"]),
    });
    expect(userRepositorySpy.findOne).not.toHaveBeenCalled();
    expect(monthlyRecordRepositorySpy.findByIdAndUserId).not.toHaveBeenCalled();
    expect(getByUserIdTransactionUseCaseSpy.handle).not.toHaveBeenCalled();
  });

  test("should throw NotFoundError if user does not exist", async () => {
    const {
      sut,
      userRepositorySpy,
      monthlyRecordRepositorySpy,
      getByUserIdTransactionUseCaseSpy,
    } = makeSut();
    userRepositorySpy.findOne.mockResolvedValue(null);

    const input = {
      userId: mockUser.id,
      monthlyRecordId: mockMonthlyRecord.id,
      format: "csv" as any,
    };

    await expect(sut.handle(input)).rejects.toThrow(
      new NotFoundError(`Usuário com ID ${input.userId} não encontrado`)
    );
    expect(userRepositorySpy.findOne).toHaveBeenCalledWith({
      id: input.userId,
    });
    expect(userRepositorySpy.findOne).toHaveBeenCalledTimes(1);
    expect(monthlyRecordRepositorySpy.findByIdAndUserId).not.toHaveBeenCalled();
    expect(getByUserIdTransactionUseCaseSpy.handle).not.toHaveBeenCalled();
  });

  test("should throw NotFoundError if monthly record does not exist", async () => {
    const {
      sut,
      userRepositorySpy,
      monthlyRecordRepositorySpy,
      getByUserIdTransactionUseCaseSpy,
    } = makeSut();
    userRepositorySpy.findOne.mockResolvedValue(mockUser);
    monthlyRecordRepositorySpy.findByIdAndUserId.mockResolvedValue(null);

    const input = {
      userId: mockUser.id,
      monthlyRecordId: mockMonthlyRecord.id,
      format: "csv" as any,
    };

    await expect(sut.handle(input)).rejects.toThrow(
      new NotFoundError(
        `Registro mensal com ID ${input.monthlyRecordId} não encontrado`
      )
    );
    expect(userRepositorySpy.findOne).toHaveBeenCalledWith({
      id: input.userId,
    });
    expect(userRepositorySpy.findOne).toHaveBeenCalledTimes(1);
    expect(monthlyRecordRepositorySpy.findByIdAndUserId).toHaveBeenCalledWith({
      id: String(input.monthlyRecordId),
      userId: input.userId,
    });
    expect(monthlyRecordRepositorySpy.findByIdAndUserId).toHaveBeenCalledTimes(
      1
    );
    expect(getByUserIdTransactionUseCaseSpy.handle).not.toHaveBeenCalled();
  });

  test("should throw ServerError on getByUserIdTransactionUseCase error", async () => {
    const {
      sut,
      userRepositorySpy,
      monthlyRecordRepositorySpy,
      getByUserIdTransactionUseCaseSpy,
      genericExportUseCaseSpy,
    } = makeSut();
    const mockError = new Error("Database error");
    getByUserIdTransactionUseCaseSpy.handle.mockRejectedValue(mockError);

    const input = {
      userId: mockUser.id,
      monthlyRecordId: mockMonthlyRecord.id,
      format: "csv" as any,
    };

    await expect(sut.handle(input)).rejects.toThrow(
      new ServerError("Falha na exportação das transações: Database error")
    );
    expect(userRepositorySpy.findOne).toHaveBeenCalledWith({
      id: input.userId,
    });
    expect(userRepositorySpy.findOne).toHaveBeenCalledTimes(1);
    expect(monthlyRecordRepositorySpy.findByIdAndUserId).toHaveBeenCalledWith({
      id: String(input.monthlyRecordId),
      userId: input.userId,
    });
    expect(monthlyRecordRepositorySpy.findByIdAndUserId).toHaveBeenCalledTimes(
      1
    );
    expect(getByUserIdTransactionUseCaseSpy.handle).toHaveBeenCalledWith({
      userId: input.userId,
      monthlyRecordId: input.monthlyRecordId,
    });
    expect(getByUserIdTransactionUseCaseSpy.handle).toHaveBeenCalledTimes(1);
    expect(genericExportUseCaseSpy.handle).not.toHaveBeenCalled();
  });

  test("should throw ServerError on genericExportUseCase error", async () => {
    const {
      sut,
      userRepositorySpy,
      monthlyRecordRepositorySpy,
      getByUserIdTransactionUseCaseSpy,
      genericExportUseCaseSpy,
    } = makeSut();
    const mockError = new Error("Export error");
    genericExportUseCaseSpy.handle.mockRejectedValue(mockError);

    const input = {
      userId: mockUser.id,
      monthlyRecordId: mockMonthlyRecord.id,
      format: "csv" as any,
    };

    await expect(sut.handle(input)).rejects.toThrow(
      new ServerError("Falha na exportação das transações: Export error")
    );
    expect(userRepositorySpy.findOne).toHaveBeenCalledWith({
      id: input.userId,
    });
    expect(userRepositorySpy.findOne).toHaveBeenCalledTimes(1);
    expect(monthlyRecordRepositorySpy.findByIdAndUserId).toHaveBeenCalledWith({
      id: String(input.monthlyRecordId),
      userId: input.userId,
    });
    expect(monthlyRecordRepositorySpy.findByIdAndUserId).toHaveBeenCalledTimes(
      1
    );
    expect(getByUserIdTransactionUseCaseSpy.handle).toHaveBeenCalledWith({
      userId: input.userId,
      monthlyRecordId: input.monthlyRecordId,
    });
    expect(getByUserIdTransactionUseCaseSpy.handle).toHaveBeenCalledTimes(1);
    expect(genericExportUseCaseSpy.handle).toHaveBeenCalledTimes(1);
  });
});
