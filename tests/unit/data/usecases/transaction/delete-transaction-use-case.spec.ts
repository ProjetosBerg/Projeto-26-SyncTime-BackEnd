import { UserRepositoryProtocol } from "@/infra/db/interfaces/userRepositoryProtocol";
import { MonthlyRecordRepositoryProtocol } from "@/infra/db/interfaces/monthlyRecordRepositoryProtocol";
import { NotFoundError } from "@/data/errors/NotFoundError";
import { ServerError } from "@/data/errors/ServerError";
import { ValidationError } from "yup";
import { mockTransaction } from "@/tests/unit/mocks/transaction/mockTransaction";
import { mockMonthlyRecord } from "@/tests/unit/mocks/monthlyRecord/mockMonthlyRecord";
import { TransactionRepositoryProtocol } from "@/infra/db/interfaces/transactionRepositoryProtocol";
import { DeleteTransactionUseCase } from "@/data/usecases/transactions/deleteTransactionUseCase";
import { mockUser } from "@/tests/unit/mocks/user/mockUser";
import { TransactionCustomFieldRepositoryProtocol } from "@/infra/db/interfaces/TransactionCustomFieldRepositoryProtocol";
import { mockCustomField } from "@/tests/unit/mocks/customFields/mockCustomFields";

export const makeTransactionRepository =
  (): jest.Mocked<TransactionRepositoryProtocol> => ({
    create: jest.fn(),
    findByUserIdAndMonthlyRecordId: jest.fn(),
    findByIdAndUserId: jest.fn().mockResolvedValue(mockTransaction),
    delete: jest.fn().mockResolvedValue(undefined),
    ...({} as any),
  });

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
export const makeTransactionCustomFieldsRepository =
  (): jest.Mocked<TransactionCustomFieldRepositoryProtocol> => ({
    create: jest.fn().mockResolvedValue(mockTransaction),
    findByNameAndUserId: jest.fn().mockResolvedValue(null),
    findByIdAndUserId: jest.fn().mockResolvedValue(mockTransaction),
    update: jest.fn().mockResolvedValue(mockTransaction),
    findByTransactionId: jest.fn().mockResolvedValue([mockCustomField]),
    deleteByTransactionId: jest.fn().mockResolvedValue(undefined),
    ...({} as any),
  });

const makeSut = () => {
  const transactionRepositorySpy = makeTransactionRepository();
  const userRepositorySpy = makeUserRepository();
  const monthlyRecordRepositorySpy = makeMonthlyRecordRepository();
  const transactionCustomFieldsRepositorySpy =
    makeTransactionCustomFieldsRepository();
  const sut = new DeleteTransactionUseCase(
    transactionRepositorySpy,
    userRepositorySpy,
    monthlyRecordRepositorySpy,
    transactionCustomFieldsRepositorySpy
  );

  return {
    sut,
    transactionRepositorySpy,
    userRepositorySpy,
    monthlyRecordRepositorySpy,
  };
};

describe("DeleteTransactionUseCase", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should delete a transaction successfully", async () => {
    const {
      sut,
      transactionRepositorySpy,
      userRepositorySpy,
      monthlyRecordRepositorySpy,
    } = makeSut();
    userRepositorySpy.findOne.mockResolvedValue(mockUser);
    transactionRepositorySpy.findByIdAndUserId.mockResolvedValue(
      mockTransaction
    );
    monthlyRecordRepositorySpy.findByIdAndUserId.mockResolvedValue(
      mockMonthlyRecord
    );
    transactionRepositorySpy.delete.mockResolvedValue(undefined);

    const input = {
      transactionId: mockTransaction.id,
      userId: mockUser.id,
    };

    await expect(sut.handle(input)).resolves.toBeUndefined();
    expect(userRepositorySpy.findOne).toHaveBeenCalledWith({
      id: input.userId,
    });
    expect(userRepositorySpy.findOne).toHaveBeenCalledTimes(1);
    expect(transactionRepositorySpy.findByIdAndUserId).toHaveBeenCalledWith({
      id: input.transactionId,
      userId: input.userId,
    });
    expect(transactionRepositorySpy.findByIdAndUserId).toHaveBeenCalledTimes(1);
    expect(monthlyRecordRepositorySpy.findByIdAndUserId).toHaveBeenCalledWith({
      id: mockTransaction.monthly_record_id,
      userId: input.userId,
    });
    expect(monthlyRecordRepositorySpy.findByIdAndUserId).toHaveBeenCalledTimes(
      1
    );
    expect(transactionRepositorySpy.delete).toHaveBeenCalledWith({
      id: input.transactionId,
      userId: input.userId,
    });
    expect(transactionRepositorySpy.delete).toHaveBeenCalledTimes(1);
  });

  test("should throw ValidationError if id is empty", async () => {
    const {
      sut,
      transactionRepositorySpy,
      userRepositorySpy,
      monthlyRecordRepositorySpy,
    } = makeSut();
    const input = {
      transactionId: "",
      userId: mockUser.id,
    };

    await expect(sut.handle(input)).rejects.toThrow(ValidationError);
    await expect(sut.handle(input)).rejects.toMatchObject({
      errors: expect.arrayContaining(["ID da transação é obrigatório"]),
    });
    expect(userRepositorySpy.findOne).not.toHaveBeenCalled();
    expect(transactionRepositorySpy.findByIdAndUserId).not.toHaveBeenCalled();
    expect(monthlyRecordRepositorySpy.findByIdAndUserId).not.toHaveBeenCalled();
    expect(transactionRepositorySpy.delete).not.toHaveBeenCalled();
  });

  test("should throw ValidationError if userId is empty", async () => {
    const {
      sut,
      transactionRepositorySpy,
      userRepositorySpy,
      monthlyRecordRepositorySpy,
    } = makeSut();
    const input = {
      transactionId: mockTransaction.id,
      userId: "",
    };

    await expect(sut.handle(input)).rejects.toThrow(ValidationError);
    await expect(sut.handle(input)).rejects.toMatchObject({
      errors: expect.arrayContaining(["ID do Usuário é obrigatório"]),
    });
    expect(userRepositorySpy.findOne).not.toHaveBeenCalled();
    expect(transactionRepositorySpy.findByIdAndUserId).not.toHaveBeenCalled();
    expect(monthlyRecordRepositorySpy.findByIdAndUserId).not.toHaveBeenCalled();
    expect(transactionRepositorySpy.delete).not.toHaveBeenCalled();
  });

  test("should throw NotFoundError if user does not exist", async () => {
    const {
      sut,
      transactionRepositorySpy,
      userRepositorySpy,
      monthlyRecordRepositorySpy,
    } = makeSut();
    userRepositorySpy.findOne.mockResolvedValue(null);

    const input = {
      transactionId: mockTransaction.id,
      userId: mockUser.id,
    };

    await expect(sut.handle(input)).rejects.toThrow(
      new NotFoundError(`Usuário com ID ${input.userId} não encontrado`)
    );
    expect(userRepositorySpy.findOne).toHaveBeenCalledWith({
      id: input.userId,
    });
    expect(userRepositorySpy.findOne).toHaveBeenCalledTimes(1);
    expect(transactionRepositorySpy.findByIdAndUserId).not.toHaveBeenCalled();
    expect(monthlyRecordRepositorySpy.findByIdAndUserId).not.toHaveBeenCalled();
    expect(transactionRepositorySpy.delete).not.toHaveBeenCalled();
  });

  test("should throw NotFoundError if transaction does not exist", async () => {
    const {
      sut,
      transactionRepositorySpy,
      userRepositorySpy,
      monthlyRecordRepositorySpy,
    } = makeSut();
    userRepositorySpy.findOne.mockResolvedValue(mockUser);
    transactionRepositorySpy.findByIdAndUserId.mockResolvedValue(null);

    const input = {
      transactionId: mockTransaction.id,
      userId: mockUser.id,
    };

    await expect(sut.handle(input)).rejects.toThrow(
      new NotFoundError(
        `Transação com ID ${input.transactionId} não encontrada para este usuário`
      )
    );
    expect(userRepositorySpy.findOne).toHaveBeenCalledWith({
      id: input.userId,
    });
    expect(userRepositorySpy.findOne).toHaveBeenCalledTimes(1);
    expect(transactionRepositorySpy.findByIdAndUserId).toHaveBeenCalledWith({
      id: input.transactionId,
      userId: input.userId,
    });
    expect(transactionRepositorySpy.findByIdAndUserId).toHaveBeenCalledTimes(1);
    expect(monthlyRecordRepositorySpy.findByIdAndUserId).not.toHaveBeenCalled();
    expect(transactionRepositorySpy.delete).not.toHaveBeenCalled();
  });

  test("should throw NotFoundError if monthly record does not exist", async () => {
    const {
      sut,
      transactionRepositorySpy,
      userRepositorySpy,
      monthlyRecordRepositorySpy,
    } = makeSut();
    userRepositorySpy.findOne.mockResolvedValue(mockUser);
    transactionRepositorySpy.findByIdAndUserId.mockResolvedValue(
      mockTransaction
    );
    monthlyRecordRepositorySpy.findByIdAndUserId.mockResolvedValue(null);

    const input = {
      transactionId: mockTransaction.id,
      userId: mockUser.id,
    };

    await expect(sut.handle(input)).rejects.toThrow(
      new NotFoundError(
        `Registro mensal com ID ${mockTransaction.monthly_record_id} não encontrado para este usuário`
      )
    );
    expect(userRepositorySpy.findOne).toHaveBeenCalledWith({
      id: input.userId,
    });
    expect(userRepositorySpy.findOne).toHaveBeenCalledTimes(1);
    expect(transactionRepositorySpy.findByIdAndUserId).toHaveBeenCalledWith({
      id: input.transactionId,
      userId: input.userId,
    });
    expect(transactionRepositorySpy.findByIdAndUserId).toHaveBeenCalledTimes(1);
    expect(monthlyRecordRepositorySpy.findByIdAndUserId).toHaveBeenCalledWith({
      id: mockTransaction.monthly_record_id,
      userId: input.userId,
    });
    expect(monthlyRecordRepositorySpy.findByIdAndUserId).toHaveBeenCalledTimes(
      1
    );
    expect(transactionRepositorySpy.delete).not.toHaveBeenCalled();
  });

  test("should throw ServerError on unexpected error", async () => {
    const {
      sut,
      transactionRepositorySpy,
      userRepositorySpy,
      monthlyRecordRepositorySpy,
    } = makeSut();
    userRepositorySpy.findOne.mockResolvedValue(mockUser);
    transactionRepositorySpy.findByIdAndUserId.mockResolvedValue(
      mockTransaction
    );
    monthlyRecordRepositorySpy.findByIdAndUserId.mockResolvedValue(
      mockMonthlyRecord
    );
    transactionRepositorySpy.delete.mockRejectedValue(
      new Error("Database error")
    );

    const input = {
      transactionId: mockTransaction.id,
      userId: mockUser.id,
    };

    await expect(sut.handle(input)).rejects.toThrow(
      new ServerError("Falha ao deletar a transação: Database error")
    );
    expect(userRepositorySpy.findOne).toHaveBeenCalledWith({
      id: input.userId,
    });
    expect(userRepositorySpy.findOne).toHaveBeenCalledTimes(1);
    expect(transactionRepositorySpy.findByIdAndUserId).toHaveBeenCalledWith({
      id: input.transactionId,
      userId: input.userId,
    });
    expect(transactionRepositorySpy.findByIdAndUserId).toHaveBeenCalledTimes(1);
    expect(monthlyRecordRepositorySpy.findByIdAndUserId).toHaveBeenCalledWith({
      id: mockTransaction.monthly_record_id,
      userId: input.userId,
    });
    expect(monthlyRecordRepositorySpy.findByIdAndUserId).toHaveBeenCalledTimes(
      1
    );
    expect(transactionRepositorySpy.delete).toHaveBeenCalledWith({
      id: input.transactionId,
      userId: input.userId,
    });
    expect(transactionRepositorySpy.delete).toHaveBeenCalledTimes(1);
  });
});
