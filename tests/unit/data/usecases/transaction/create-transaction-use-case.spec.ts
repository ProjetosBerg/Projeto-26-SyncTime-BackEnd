import { UserRepositoryProtocol } from "@/infra/db/interfaces/userRepositoryProtocol";
import { CategoryRepositoryProtocol } from "@/infra/db/interfaces/categoryRepositoryProtocol";
import { MonthlyRecordRepositoryProtocol } from "@/infra/db/interfaces/monthlyRecordRepositoryProtocol";
import { NotFoundError } from "@/data/errors/NotFoundError";
import { BusinessRuleError } from "@/data/errors/BusinessRuleError";
import { ServerError } from "@/data/errors/ServerError";
import { ValidationError } from "yup";
import { mockMonthlyRecord } from "@/tests/unit/mocks/monthlyRecord/mockMonthlyRecord";
import { mockCategory } from "@/tests/unit/mocks/category/mockCategory";
import { mockTransaction } from "@/tests/unit/mocks/transaction/mockTransaction";
import { mockUser } from "@/tests/unit/mocks/user/mockUser";
import { TransactionRepositoryProtocol } from "@/infra/db/interfaces/transactionRepositoryProtocol";
import { CreateTransactionUseCase } from "@/data/usecases/transactions/createTransactionUseCase";
import { CustomFieldsRepositoryProtocol } from "@/infra/db/interfaces/customFieldsRepositoryProtocol";
import { mockCustomField } from "@/tests/unit/mocks/customFields/mockCustomFields";
import { TransactionCustomFieldRepositoryProtocol } from "@/infra/db/interfaces/TransactionCustomFieldRepositoryProtocol";

export const makeTransactionRepository =
  (): jest.Mocked<TransactionRepositoryProtocol> => ({
    create: jest.fn().mockResolvedValue(mockTransaction),
    ...({} as any),
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

export const makeCustomFieldsRepository =
  (): jest.Mocked<CustomFieldsRepositoryProtocol> => ({
    create: jest.fn().mockResolvedValue(mockCustomField),
    findByNameAndUserId: jest.fn().mockResolvedValue(null),
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
  const categoryRepositorySpy = makeCategoryRepository();
  const monthlyRecordRepositorySpy = makeMonthlyRecordRepository();
  const customFieldsRepositorySpy = makeCustomFieldsRepository();
  const transactionCustomFieldsRepositorySpy =
    makeTransactionCustomFieldsRepository();
  const sut = new CreateTransactionUseCase(
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

describe("CreateTransactionUseCase", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should create a transaction successfully", async () => {
    const {
      sut,
      transactionRepositorySpy,
      userRepositorySpy,
      categoryRepositorySpy,
      monthlyRecordRepositorySpy,
    } = makeSut();
    userRepositorySpy.findOne.mockResolvedValue(mockUser);
    categoryRepositorySpy.findByIdAndUserId.mockResolvedValue(mockCategory);
    monthlyRecordRepositorySpy.findByIdAndUserId.mockResolvedValue(
      mockMonthlyRecord
    );
    transactionRepositorySpy.create.mockResolvedValue(mockTransaction);

    const input = {
      title: "teste",
      description: "teste",
      amount: 150.75,
      transactionDate: new Date("2025-07-02"),
      monthlyRecordId: mockMonthlyRecord.id,
      categoryId: mockCategory.id,
      userId: mockUser.id,
      customFields: [],
    };

    const result = await sut.handle(input);

    expect(result).toEqual({
      transaction: mockTransaction,
      customFields: undefined,
    });
    expect(userRepositorySpy.findOne).toHaveBeenCalledWith({
      id: input.userId,
    });
    expect(userRepositorySpy.findOne).toHaveBeenCalledTimes(1);
    expect(categoryRepositorySpy.findByIdAndUserId).toHaveBeenCalledWith({
      id: input.categoryId,
      userId: input.userId,
    });
    expect(categoryRepositorySpy.findByIdAndUserId).toHaveBeenCalledTimes(1);
    expect(monthlyRecordRepositorySpy.findByIdAndUserId).toHaveBeenCalledWith({
      id: input.monthlyRecordId,
      userId: input.userId,
    });
    expect(monthlyRecordRepositorySpy.findByIdAndUserId).toHaveBeenCalledTimes(
      1
    );
    expect(transactionRepositorySpy.create).toHaveBeenCalledWith({
      title: input.title,
      description: input.description,
      amount: input.amount,
      transaction_date: input.transactionDate,
      monthly_record_id: input.monthlyRecordId,
      category_id: input.categoryId,
      user_id: input.userId,
    });
    expect(transactionRepositorySpy.create).toHaveBeenCalledTimes(1);
  });

  test("should throw ValidationError if title is empty", async () => {
    const {
      sut,
      transactionRepositorySpy,
      userRepositorySpy,
      categoryRepositorySpy,
      monthlyRecordRepositorySpy,
    } = makeSut();
    const input = {
      title: "",
      description: "teste",
      amount: 150.75,
      transactionDate: new Date("2025-07-02"),
      monthlyRecordId: mockMonthlyRecord.id,
      categoryId: mockCategory.id,
      userId: mockUser.id,
    };

    await expect(sut.handle(input)).rejects.toThrow(ValidationError);
    await expect(sut.handle(input)).rejects.toMatchObject({
      errors: expect.arrayContaining(["Título é obrigatório"]),
    });
    expect(userRepositorySpy.findOne).not.toHaveBeenCalled();
    expect(categoryRepositorySpy.findByIdAndUserId).not.toHaveBeenCalled();
    expect(monthlyRecordRepositorySpy.findByIdAndUserId).not.toHaveBeenCalled();
    expect(transactionRepositorySpy.create).not.toHaveBeenCalled();
  });

  test("should throw ValidationError if amount is negative", async () => {
    const {
      sut,
      transactionRepositorySpy,
      userRepositorySpy,
      categoryRepositorySpy,
      monthlyRecordRepositorySpy,
    } = makeSut();
    const input = {
      title: "teste",
      description: "teste",
      amount: -50,
      transactionDate: new Date("2025-07-02"),
      monthlyRecordId: mockMonthlyRecord.id,
      categoryId: mockCategory.id,
      userId: mockUser.id,
    };

    await expect(sut.handle(input)).rejects.toThrow(ValidationError);
    await expect(sut.handle(input)).rejects.toMatchObject({
      errors: expect.arrayContaining(["Valor deve ser maior ou igual a 0"]),
    });
    expect(userRepositorySpy.findOne).not.toHaveBeenCalled();
    expect(categoryRepositorySpy.findByIdAndUserId).not.toHaveBeenCalled();
    expect(monthlyRecordRepositorySpy.findByIdAndUserId).not.toHaveBeenCalled();
    expect(transactionRepositorySpy.create).not.toHaveBeenCalled();
  });

  test("should throw ValidationError if transaction_date is invalid", async () => {
    const {
      sut,
      transactionRepositorySpy,
      userRepositorySpy,
      categoryRepositorySpy,
      monthlyRecordRepositorySpy,
    } = makeSut();
    const input = {
      title: "teste",
      description: "teste",
      amount: 150.75,
      transactionDate: "invalid-date" as any,
      monthlyRecordId: mockMonthlyRecord.id,
      categoryId: mockCategory.id,
      userId: mockUser.id,
    };

    await expect(sut.handle(input)).rejects.toThrow(ValidationError);
    await expect(sut.handle(input)).rejects.toMatchObject({
      errors: expect.arrayContaining([
        "Data da transação deve ser uma data válida",
      ]),
    });
    expect(userRepositorySpy.findOne).not.toHaveBeenCalled();
    expect(categoryRepositorySpy.findByIdAndUserId).not.toHaveBeenCalled();
    expect(monthlyRecordRepositorySpy.findByIdAndUserId).not.toHaveBeenCalled();
    expect(transactionRepositorySpy.create).not.toHaveBeenCalled();
  });

  test("should throw NotFoundError if user does not exist", async () => {
    const {
      sut,
      transactionRepositorySpy,
      userRepositorySpy,
      categoryRepositorySpy,
      monthlyRecordRepositorySpy,
    } = makeSut();
    userRepositorySpy.findOne.mockResolvedValue(null);

    const input = {
      title: "teste",
      description: "teste",
      amount: 150.75,
      transactionDate: new Date("2025-07-02"),
      monthlyRecordId: mockMonthlyRecord.id,
      categoryId: mockCategory.id,
      userId: "user-id",
    };

    await expect(sut.handle(input)).rejects.toThrow(
      new NotFoundError(`Usuário com ID ${input.userId} não encontrado`)
    );
    expect(userRepositorySpy.findOne).toHaveBeenCalledWith({
      id: input.userId,
    });
    expect(userRepositorySpy.findOne).toHaveBeenCalledTimes(1);
    expect(categoryRepositorySpy.findByIdAndUserId).not.toHaveBeenCalled();
    expect(monthlyRecordRepositorySpy.findByIdAndUserId).not.toHaveBeenCalled();
    expect(transactionRepositorySpy.create).not.toHaveBeenCalled();
  });

  test("should throw NotFoundError if category does not exist", async () => {
    const {
      sut,
      transactionRepositorySpy,
      userRepositorySpy,
      categoryRepositorySpy,
      monthlyRecordRepositorySpy,
    } = makeSut();
    userRepositorySpy.findOne.mockResolvedValue(mockUser);
    categoryRepositorySpy.findByIdAndUserId.mockResolvedValue(null);

    const input = {
      title: "teste",
      description: "teste",
      amount: 150.75,
      transactionDate: new Date("2025-07-02"),
      monthlyRecordId: mockMonthlyRecord.id,
      categoryId: "category-id",
      userId: "user-id",
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
    expect(categoryRepositorySpy.findByIdAndUserId).toHaveBeenCalledWith({
      id: input.categoryId,
      userId: input.userId,
    });
    expect(categoryRepositorySpy.findByIdAndUserId).toHaveBeenCalledTimes(1);
    expect(monthlyRecordRepositorySpy.findByIdAndUserId).not.toHaveBeenCalled();
    expect(transactionRepositorySpy.create).not.toHaveBeenCalled();
  });

  test("should throw NotFoundError if monthly record does not exist", async () => {
    const {
      sut,
      transactionRepositorySpy,
      userRepositorySpy,
      categoryRepositorySpy,
      monthlyRecordRepositorySpy,
    } = makeSut();
    userRepositorySpy.findOne.mockResolvedValue(mockUser);
    categoryRepositorySpy.findByIdAndUserId.mockResolvedValue(mockCategory);
    monthlyRecordRepositorySpy.findByIdAndUserId.mockResolvedValue(null);

    const input = {
      title: "teste",
      description: "teste",
      amount: 150.75,
      transactionDate: new Date("2025-07-02"),
      monthlyRecordId: mockMonthlyRecord.id,
      categoryId: "category-id",
      userId: "user-id",
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
    expect(categoryRepositorySpy.findByIdAndUserId).toHaveBeenCalledWith({
      id: input.categoryId,
      userId: input.userId,
    });
    expect(categoryRepositorySpy.findByIdAndUserId).toHaveBeenCalledTimes(1);
    expect(monthlyRecordRepositorySpy.findByIdAndUserId).toHaveBeenCalledWith({
      id: input.monthlyRecordId,
      userId: input.userId,
    });
    expect(monthlyRecordRepositorySpy.findByIdAndUserId).toHaveBeenCalledTimes(
      1
    );
    expect(transactionRepositorySpy.create).not.toHaveBeenCalled();
  });

  test("should throw BusinessRuleError if transaction date is outside monthly record's month and year", async () => {
    const {
      sut,
      transactionRepositorySpy,
      userRepositorySpy,
      categoryRepositorySpy,
      monthlyRecordRepositorySpy,
    } = makeSut();
    userRepositorySpy.findOne.mockResolvedValue(mockUser);
    categoryRepositorySpy.findByIdAndUserId.mockResolvedValue(mockCategory);
    monthlyRecordRepositorySpy.findByIdAndUserId.mockResolvedValue(
      mockMonthlyRecord
    );

    const input = {
      title: "teste",
      description: "teste",
      amount: 150.75,
      transactionDate: new Date("2025-07-01"),
      monthlyRecordId: mockMonthlyRecord.id,
      categoryId: "category-id",
      userId: "user-id",
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
    expect(categoryRepositorySpy.findByIdAndUserId).toHaveBeenCalledWith({
      id: input.categoryId,
      userId: input.userId,
    });
    expect(categoryRepositorySpy.findByIdAndUserId).toHaveBeenCalledTimes(1);
    expect(monthlyRecordRepositorySpy.findByIdAndUserId).toHaveBeenCalledWith({
      id: input.monthlyRecordId,
      userId: input.userId,
    });
    expect(monthlyRecordRepositorySpy.findByIdAndUserId).toHaveBeenCalledTimes(
      1
    );
    expect(transactionRepositorySpy.create).not.toHaveBeenCalled();
  });

  test("should throw ServerError on unexpected error", async () => {
    const {
      sut,
      transactionRepositorySpy,
      userRepositorySpy,
      categoryRepositorySpy,
      monthlyRecordRepositorySpy,
    } = makeSut();
    userRepositorySpy.findOne.mockResolvedValue(mockUser);
    categoryRepositorySpy.findByIdAndUserId.mockResolvedValue(mockCategory);
    monthlyRecordRepositorySpy.findByIdAndUserId.mockResolvedValue(
      mockMonthlyRecord
    );
    transactionRepositorySpy.create.mockRejectedValue(
      new Error("Database error")
    );

    const input = {
      title: "teste",
      description: "teste",
      amount: 150.75,
      transactionDate: new Date("2025-07-02"),
      monthlyRecordId: mockMonthlyRecord.id,
      categoryId: "category-id",
      userId: "user-id",
    };

    await expect(sut.handle(input)).rejects.toThrow(
      new ServerError("Falha no cadastro da transação: Database error")
    );
    expect(userRepositorySpy.findOne).toHaveBeenCalledWith({
      id: input.userId,
    });
    expect(userRepositorySpy.findOne).toHaveBeenCalledTimes(1);
    expect(categoryRepositorySpy.findByIdAndUserId).toHaveBeenCalledWith({
      id: input.categoryId,
      userId: input.userId,
    });
    expect(categoryRepositorySpy.findByIdAndUserId).toHaveBeenCalledTimes(1);
    expect(monthlyRecordRepositorySpy.findByIdAndUserId).toHaveBeenCalledWith({
      id: input.monthlyRecordId,
      userId: input.userId,
    });
    expect(monthlyRecordRepositorySpy.findByIdAndUserId).toHaveBeenCalledTimes(
      1
    );
    expect(transactionRepositorySpy.create).toHaveBeenCalledWith({
      title: input.title,
      description: input.description,
      amount: input.amount,
      transaction_date: input.transactionDate,
      monthly_record_id: input.monthlyRecordId,
      category_id: input.categoryId,
      user_id: input.userId,
    });
    expect(transactionRepositorySpy.create).toHaveBeenCalledTimes(1);
  });
});
