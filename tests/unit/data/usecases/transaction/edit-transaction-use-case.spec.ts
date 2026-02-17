import { UserRepositoryProtocol } from "@/infra/db/interfaces/userRepositoryProtocol";
import { CategoryRepositoryProtocol } from "@/infra/db/interfaces/categoryRepositoryProtocol";
import { MonthlyRecordRepositoryProtocol } from "@/infra/db/interfaces/monthlyRecordRepositoryProtocol";
import { NotFoundError } from "@/data/errors/NotFoundError";
import { BusinessRuleError } from "@/data/errors/BusinessRuleError";
import { ServerError } from "@/data/errors/ServerError";
import { ValidationError } from "yup";
import { mockTransaction } from "@/tests/unit/mocks/transaction/mockTransaction";
import { mockMonthlyRecord } from "@/tests/unit/mocks/monthlyRecord/mockMonthlyRecord";
import { mockCategory } from "@/tests/unit/mocks/category/mockCategory";
import { TransactionRepositoryProtocol } from "@/infra/db/interfaces/transactionRepositoryProtocol";
import { EditTransactionUseCase } from "@/data/usecases/transactions/editTransactionUseCase";
import { mockUser } from "@/tests/unit/mocks/user/mockUser";
import { CustomFieldsRepositoryProtocol } from "@/infra/db/interfaces/customFieldsRepositoryProtocol";
import { TransactionCustomFieldRepositoryProtocol } from "@/infra/db/interfaces/TransactionCustomFieldRepositoryProtocol";
import { mockCustomField } from "@/tests/unit/mocks/customFields/mockCustomFields";

const mockUpdatedTransaction = {
  ...mockTransaction,
  title: "Updated teste",
  description: "Updated Description teste",
  amount: 200.5,
  transaction_date: new Date("2025-07-02"),
  monthly_record_id: mockMonthlyRecord.id,
  category_id: mockCategory.id,
};

export const makeTransactionRepository =
  (): jest.Mocked<TransactionRepositoryProtocol> => ({
    create: jest.fn(),
    findByUserIdAndMonthlyRecordId: jest.fn(),
    findByIdAndUserId: jest.fn().mockResolvedValue(mockTransaction),
    delete: jest.fn(),
    update: jest.fn().mockResolvedValue(mockUpdatedTransaction),
  });

export const makeUserRepository = (): jest.Mocked<UserRepositoryProtocol> => ({
  findOne: jest.fn().mockResolvedValue(mockUser),
  ...({} as any),
});

export const makeCategoryRepository =
  (): jest.Mocked<CategoryRepositoryProtocol> => ({
    create: jest.fn(),
    findByNameAndUserId: jest.fn(),
    findByIdAndUserId: jest.fn().mockResolvedValue(mockCategory),
    delete: jest.fn(),
    update: jest.fn(),
    ...({} as any),
  });

export const makeCustomFieldsRepository =
  (): jest.Mocked<CustomFieldsRepositoryProtocol> => ({
    create: jest.fn().mockResolvedValue(mockCustomField),
    findByNameAndUserId: jest.fn().mockResolvedValue(null),
    findByIdsAndUserId: jest.fn().mockResolvedValue([mockCustomField]),
    ...({} as any),
  });
export const makeTransactionCustomFieldsRepository =
  (): jest.Mocked<TransactionCustomFieldRepositoryProtocol> => ({
    create: jest.fn().mockResolvedValue(mockTransaction),
    findByNameAndUserId: jest.fn().mockResolvedValue(null),
    findByIdAndUserId: jest.fn().mockResolvedValue(mockTransaction),
    update: jest.fn().mockResolvedValue(mockTransaction),
    findByTransactionId: jest.fn().mockResolvedValue([]),
    findByIdsAndUserId: jest.fn().mockResolvedValue([mockCustomField]),
    deleteByTransactionId: jest.fn().mockResolvedValue(undefined),
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

const makeSut = () => {
  const transactionRepositorySpy = makeTransactionRepository();
  const userRepositorySpy = makeUserRepository();
  const categoryRepositorySpy = makeCategoryRepository();
  const monthlyRecordRepositorySpy = makeMonthlyRecordRepository();
  const customFieldsRepositorySpy = makeCustomFieldsRepository();
  const transactionCustomFieldsRepositorySpy =
    makeTransactionCustomFieldsRepository();
  const sut = new EditTransactionUseCase(
    transactionRepositorySpy,
    userRepositorySpy,
    categoryRepositorySpy,
    monthlyRecordRepositorySpy,
    customFieldsRepositorySpy,
    transactionCustomFieldsRepositorySpy
  );

  return {
    sut,
    transactionRepositorySpy,
    userRepositorySpy,
    categoryRepositorySpy,
    monthlyRecordRepositorySpy,
  };
};

describe("EditTransactionUseCase", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should update a transaction successfully", async () => {
    const {
      sut,
      transactionRepositorySpy,
      userRepositorySpy,
      categoryRepositorySpy,
      monthlyRecordRepositorySpy,
    } = makeSut();
    userRepositorySpy.findOne.mockResolvedValue(mockUser);
    transactionRepositorySpy.findByIdAndUserId.mockResolvedValue(
      mockTransaction
    );
    monthlyRecordRepositorySpy.findByIdAndUserId.mockResolvedValue(
      mockMonthlyRecord
    );
    categoryRepositorySpy.findByIdAndUserId.mockResolvedValue(mockCategory);
    transactionRepositorySpy.update.mockResolvedValue(mockUpdatedTransaction);

    const input = {
      transactionId: mockTransaction.id,
      userId: mockUser.id,
      title: mockUpdatedTransaction.title,
      description: mockUpdatedTransaction.description,
      amount: 200.5,
      transactionDate: new Date("2025-07-02"),
      monthlyRecordId: mockMonthlyRecord.id,
      categoryId: mockCategory.id,
      customFields: [],
    };

    const result = await sut.handle(input);

    expect(result).toEqual({
      transaction: mockUpdatedTransaction,
      customFields: [],
    });
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
      id: input.monthlyRecordId,
      userId: input.userId,
    });
    expect(monthlyRecordRepositorySpy.findByIdAndUserId).toHaveBeenCalledTimes(
      1
    );
    expect(categoryRepositorySpy.findByIdAndUserId).toHaveBeenCalledWith({
      id: input.categoryId,
      userId: input.userId,
    });
    expect(categoryRepositorySpy.findByIdAndUserId).toHaveBeenCalledTimes(1);
    expect(transactionRepositorySpy.update).toHaveBeenCalledWith({
      id: input.transactionId,
      title: input.title,
      description: input.description,
      amount: input.amount,
      transaction_date: input.transactionDate,
      monthly_record_id: input.monthlyRecordId,
      category_id: input.categoryId,
      userId: input.userId,
    });
    expect(transactionRepositorySpy.update).toHaveBeenCalledTimes(1);
  });

  test("should update a transaction with minimal fields", async () => {
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
    transactionRepositorySpy.update.mockResolvedValue({
      ...mockTransaction,
      title: mockUpdatedTransaction.title,
    });

    const input = {
      transactionId: mockTransaction.id,
      userId: mockUser.id,
      title: mockUpdatedTransaction.title,
    };

    const result = await sut.handle(input);

    expect(result).toEqual({
      transaction: {
        ...mockTransaction,
        title: mockUpdatedTransaction.title,
      },
      customFields: [],
    });
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
    expect(transactionRepositorySpy.update).toHaveBeenCalledWith({
      id: input.transactionId,
      title: input.title,
      userId: input.userId,
    });
    expect(transactionRepositorySpy.update).toHaveBeenCalledTimes(1);
  });

  test("should throw ValidationError if id is empty", async () => {
    const {
      sut,
      transactionRepositorySpy,
      userRepositorySpy,
      monthlyRecordRepositorySpy,
      categoryRepositorySpy,
    } = makeSut();
    const input = {
      transactionId: "",
      userId: mockUser.id,
      title: mockUpdatedTransaction.title,
    };

    await expect(sut.handle(input)).rejects.toThrow(ValidationError);
    await expect(sut.handle(input)).rejects.toMatchObject({
      errors: expect.arrayContaining(["ID da transação é obrigatório"]),
    });
    expect(userRepositorySpy.findOne).not.toHaveBeenCalled();
    expect(transactionRepositorySpy.findByIdAndUserId).not.toHaveBeenCalled();
    expect(monthlyRecordRepositorySpy.findByIdAndUserId).not.toHaveBeenCalled();
    expect(categoryRepositorySpy.findByIdAndUserId).not.toHaveBeenCalled();
    expect(transactionRepositorySpy.update).not.toHaveBeenCalled();
  });

  test("should throw ValidationError if userId is empty", async () => {
    const {
      sut,
      transactionRepositorySpy,
      userRepositorySpy,
      monthlyRecordRepositorySpy,
      categoryRepositorySpy,
    } = makeSut();
    const input = {
      transactionId: mockTransaction.id,
      userId: "",
      title: mockUpdatedTransaction.title,
    };

    await expect(sut.handle(input)).rejects.toThrow(ValidationError);
    await expect(sut.handle(input)).rejects.toMatchObject({
      errors: expect.arrayContaining(["ID do Usuário é obrigatório"]),
    });
    expect(userRepositorySpy.findOne).not.toHaveBeenCalled();
    expect(transactionRepositorySpy.findByIdAndUserId).not.toHaveBeenCalled();
    expect(monthlyRecordRepositorySpy.findByIdAndUserId).not.toHaveBeenCalled();
    expect(categoryRepositorySpy.findByIdAndUserId).not.toHaveBeenCalled();
    expect(transactionRepositorySpy.update).not.toHaveBeenCalled();
  });

  test("should throw ValidationError if amount is negative", async () => {
    const {
      sut,
      transactionRepositorySpy,
      userRepositorySpy,
      monthlyRecordRepositorySpy,
      categoryRepositorySpy,
    } = makeSut();
    const input = {
      transactionId: mockTransaction.id,
      userId: mockUser.id,
      amount: -50,
    };

    await expect(sut.handle(input)).rejects.toThrow(ValidationError);
    await expect(sut.handle(input)).rejects.toMatchObject({
      errors: expect.arrayContaining(["Valor deve ser maior ou igual a 0"]),
    });
    expect(userRepositorySpy.findOne).not.toHaveBeenCalled();
    expect(transactionRepositorySpy.findByIdAndUserId).not.toHaveBeenCalled();
    expect(monthlyRecordRepositorySpy.findByIdAndUserId).not.toHaveBeenCalled();
    expect(categoryRepositorySpy.findByIdAndUserId).not.toHaveBeenCalled();
    expect(transactionRepositorySpy.update).not.toHaveBeenCalled();
  });

  test("should throw ValidationError if transaction_date is invalid", async () => {
    const {
      sut,
      transactionRepositorySpy,
      userRepositorySpy,
      monthlyRecordRepositorySpy,
      categoryRepositorySpy,
    } = makeSut();
    const input = {
      transactionId: mockTransaction.id,
      userId: mockUser.id,
      transactionDate: "invalid-date" as any,
    };

    await expect(sut.handle(input)).rejects.toThrow(ValidationError);
    await expect(sut.handle(input)).rejects.toMatchObject({
      errors: expect.arrayContaining([
        "Data da transação deve ser uma data válida",
      ]),
    });
    expect(userRepositorySpy.findOne).not.toHaveBeenCalled();
    expect(transactionRepositorySpy.findByIdAndUserId).not.toHaveBeenCalled();
    expect(monthlyRecordRepositorySpy.findByIdAndUserId).not.toHaveBeenCalled();
    expect(categoryRepositorySpy.findByIdAndUserId).not.toHaveBeenCalled();
    expect(transactionRepositorySpy.update).not.toHaveBeenCalled();
  });

  test("should throw NotFoundError if user does not exist", async () => {
    const {
      sut,
      transactionRepositorySpy,
      userRepositorySpy,
      monthlyRecordRepositorySpy,
      categoryRepositorySpy,
    } = makeSut();
    userRepositorySpy.findOne.mockResolvedValue(null);

    const input = {
      transactionId: mockTransaction.id,
      userId: mockUser.id,
      title: mockUpdatedTransaction.title,
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
    expect(categoryRepositorySpy.findByIdAndUserId).not.toHaveBeenCalled();
    expect(transactionRepositorySpy.update).not.toHaveBeenCalled();
  });

  test("should throw NotFoundError if transaction does not exist", async () => {
    const {
      sut,
      transactionRepositorySpy,
      userRepositorySpy,
      monthlyRecordRepositorySpy,
      categoryRepositorySpy,
    } = makeSut();
    userRepositorySpy.findOne.mockResolvedValue(mockUser);
    transactionRepositorySpy.findByIdAndUserId.mockResolvedValue(null);

    const input = {
      transactionId: mockTransaction.id,
      userId: mockUser.id,
      title: mockUpdatedTransaction.title,
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
    expect(categoryRepositorySpy.findByIdAndUserId).not.toHaveBeenCalled();
    expect(transactionRepositorySpy.update).not.toHaveBeenCalled();
  });

  test("should throw NotFoundError if monthly record does not exist", async () => {
    const {
      sut,
      transactionRepositorySpy,
      userRepositorySpy,
      monthlyRecordRepositorySpy,
      categoryRepositorySpy,
    } = makeSut();
    userRepositorySpy.findOne.mockResolvedValue(mockUser);
    transactionRepositorySpy.findByIdAndUserId.mockResolvedValue(
      mockTransaction
    );
    monthlyRecordRepositorySpy.findByIdAndUserId.mockResolvedValue(null);

    const input = {
      transactionId: mockTransaction.id,
      userId: mockUser.id,
      title: mockUpdatedTransaction.title,
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
    expect(categoryRepositorySpy.findByIdAndUserId).not.toHaveBeenCalled();
    expect(transactionRepositorySpy.update).not.toHaveBeenCalled();
  });

  test("should throw NotFoundError if category does not exist", async () => {
    const {
      sut,
      transactionRepositorySpy,
      userRepositorySpy,
      monthlyRecordRepositorySpy,
      categoryRepositorySpy,
    } = makeSut();
    userRepositorySpy.findOne.mockResolvedValue(mockUser);
    transactionRepositorySpy.findByIdAndUserId.mockResolvedValue(
      mockTransaction
    );
    monthlyRecordRepositorySpy.findByIdAndUserId.mockResolvedValue(
      mockMonthlyRecord
    );
    categoryRepositorySpy.findByIdAndUserId.mockResolvedValue(null);

    const input = {
      transactionId: mockTransaction.id,
      userId: mockUser.id,
      categoryId: mockCategory.id,
    };

    await expect(sut.handle(input)).rejects.toThrow(
      new NotFoundError(
        `Categoria com ID ${input.categoryId} não encontrada para este usuário`
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
    expect(categoryRepositorySpy.findByIdAndUserId).toHaveBeenCalledWith({
      id: input.categoryId,
      userId: input.userId,
    });
    expect(categoryRepositorySpy.findByIdAndUserId).toHaveBeenCalledTimes(1);
    expect(transactionRepositorySpy.update).not.toHaveBeenCalled();
  });

  test("should throw BusinessRuleError if transaction date is outside monthly record's month and year", async () => {
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

    const input = {
      transactionId: mockTransaction.id,
      title: mockUpdatedTransaction.title,
      description: mockUpdatedTransaction.description,
      amount: mockUpdatedTransaction.amount,
      transactionDate: new Date("2025-07-01"),
      monthlyRecordId: mockMonthlyRecord.id,
      categoryId: mockCategory.id,
      userId: mockUser.id,
    };

    await expect(sut.handle(input)).rejects.toThrow(
      new BusinessRuleError(
        `A data da transação deve estar dentro do mês ${mockMonthlyRecord.month} e ano ${mockMonthlyRecord.year} do registro mensal`
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
    expect(transactionRepositorySpy.update).not.toHaveBeenCalled();
  });

  test("should throw ServerError on unexpected error", async () => {
    const {
      sut,
      transactionRepositorySpy,
      userRepositorySpy,
      monthlyRecordRepositorySpy,
      categoryRepositorySpy,
    } = makeSut();
    userRepositorySpy.findOne.mockResolvedValue(mockUser);
    transactionRepositorySpy.findByIdAndUserId.mockResolvedValue(
      mockTransaction
    );
    monthlyRecordRepositorySpy.findByIdAndUserId.mockResolvedValue(
      mockMonthlyRecord
    );
    categoryRepositorySpy.findByIdAndUserId.mockResolvedValue(mockCategory);
    transactionRepositorySpy.update.mockRejectedValue(
      new Error("Database error")
    );

    const input = {
      transactionId: mockTransaction.id,
      userId: mockUser.id,
      title: mockTransaction.title,
      description: mockTransaction.description,
      amount: 200.5,
      transactionDate: new Date("2025-07-02"),
      monthlyRecordId: mockMonthlyRecord.id,
      categoryId: mockCategory.id,
    };

    await expect(sut.handle(input)).rejects.toThrow(
      new ServerError("Falha na atualização da transação: Database error")
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
      id: input.monthlyRecordId,
      userId: input.userId,
    });
    expect(monthlyRecordRepositorySpy.findByIdAndUserId).toHaveBeenCalledTimes(
      1
    );
    expect(categoryRepositorySpy.findByIdAndUserId).toHaveBeenCalledWith({
      id: input.categoryId,
      userId: input.userId,
    });
    expect(categoryRepositorySpy.findByIdAndUserId).toHaveBeenCalledTimes(1);
    expect(transactionRepositorySpy.update).toHaveBeenCalledWith({
      id: input.transactionId,
      title: input.title,
      description: input.description,
      amount: input.amount,
      transaction_date: input.transactionDate,
      monthly_record_id: input.monthlyRecordId,
      category_id: input.categoryId,
      userId: input.userId,
    });
    expect(transactionRepositorySpy.update).toHaveBeenCalledTimes(1);
  });
});
