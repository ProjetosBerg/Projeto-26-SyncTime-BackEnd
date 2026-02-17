import { UserRepositoryProtocol } from "@/infra/db/interfaces/userRepositoryProtocol";
import { CategoryRepositoryProtocol } from "@/infra/db/interfaces/categoryRepositoryProtocol";
import { MonthlyRecordRepositoryProtocol } from "@/infra/db/interfaces/monthlyRecordRepositoryProtocol";
import { TransactionRepositoryProtocol } from "@/infra/db/interfaces/transactionRepositoryProtocol";
import { TransactionCustomFieldRepositoryProtocol } from "@/infra/db/interfaces/TransactionCustomFieldRepositoryProtocol";
import { CustomFieldsRepositoryProtocol } from "@/infra/db/interfaces/customFieldsRepositoryProtocol";
import { NotFoundError } from "@/data/errors/NotFoundError";
import { ServerError } from "@/data/errors/ServerError";
import { ValidationError } from "yup";
import { GetDashboardCategoryUseCase } from "@/data/usecases/dashboard/getDashboardCategoryUseCase";
import { mockUser } from "@/tests/unit/mocks/user/mockUser";
import { mockCategoryWithRecordType } from "@/tests/unit/mocks/category/mockCategory";

const mockMonthlyRecord = {
  id: "record-1",
  title: "Janeiro 2024",
  description: "Registro de janeiro",
  goal: 1000,
  initial_balance: 100,
  month: 1,
  year: 2024,
  status: "active",
  category_id: mockCategoryWithRecordType.id,
  user_id: mockUser.id,
  transactions: [
    {
      id: "transaction-1",
      title: "Compra 1",
      description: "Descrição da compra",
      amount: "50.00",
      transaction_date: "2024-01-15",
    },
    {
      id: "transaction-2",
      title: "Compra 2",
      description: "Outra compra",
      amount: "75.50",
      transaction_date: "2024-01-20",
    },
  ],
};

const mockCustomField = {
  id: "cf-1",
  label: "Forma de Pagamento",
  type: "text",
  record_type_id: mockCategoryWithRecordType.record_type_id,
  category_id: mockCategoryWithRecordType.id,
  user_id: mockUser.id,
};

const mockTransactionCustomFieldValue = {
  id: "tcf-1",
  transaction_id: "transaction-1",
  custom_field_id: "cf-1",
  value: "Cartão de Crédito",
  user_id: mockUser.id,
};

export const makeUserRepository = (): jest.Mocked<UserRepositoryProtocol> => ({
  findOne: jest.fn().mockResolvedValue(mockUser),
  ...({} as any),
});

export const makeCategoryRepository =
  (): jest.Mocked<CategoryRepositoryProtocol> => ({
    findByIdAndUserId: jest.fn().mockResolvedValue(mockCategoryWithRecordType),
    findByUserId: jest.fn().mockResolvedValue({
      categories: [mockCategoryWithRecordType],
      total: 1,
    }),
    ...({} as any),
  });

export const makeMonthlyRecordRepository =
  (): jest.Mocked<MonthlyRecordRepositoryProtocol> => ({
    findByUserId: jest.fn().mockResolvedValue({
      records: [mockMonthlyRecord],
      total: 1,
    }),
    ...({} as any),
  });

export const makeTransactionRepository =
  (): jest.Mocked<TransactionRepositoryProtocol> => ({
    ...({} as any),
  });

export const makeCustomFieldsRepository =
  (): jest.Mocked<CustomFieldsRepositoryProtocol> => ({
    findByRecordTypeId: jest.fn().mockResolvedValue({
      customFields: [mockCustomField],
      total: 1,
    }),
    ...({} as any),
  });

export const makeTransactionCustomFieldRepository =
  (): jest.Mocked<TransactionCustomFieldRepositoryProtocol> => ({
    findByTransactionId: jest
      .fn()
      .mockResolvedValue([mockTransactionCustomFieldValue]),
    ...({} as any),
  });

const makeSut = () => {
  const userRepositorySpy = makeUserRepository();
  const categoryRepositorySpy = makeCategoryRepository();
  const monthlyRecordRepositorySpy = makeMonthlyRecordRepository();
  const transactionRepositorySpy = makeTransactionRepository();
  const customFieldsRepositorySpy = makeCustomFieldsRepository();
  const transactionCustomFieldRepositorySpy =
    makeTransactionCustomFieldRepository();

  const sut = new GetDashboardCategoryUseCase(
    userRepositorySpy,
    categoryRepositorySpy,
    monthlyRecordRepositorySpy,
    transactionRepositorySpy,
    customFieldsRepositorySpy,
    transactionCustomFieldRepositorySpy
  );

  return {
    sut,
    userRepositorySpy,
    categoryRepositorySpy,
    monthlyRecordRepositorySpy,
    transactionRepositorySpy,
    customFieldsRepositorySpy,
    transactionCustomFieldRepositorySpy,
  };
};

describe("GetDashboardCategoryUseCase", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should return dashboard data successfully", async () => {
    const {
      sut,
      userRepositorySpy,
      categoryRepositorySpy,
      monthlyRecordRepositorySpy,
    } = makeSut();
    const input = { userId: String(mockUser.id) };

    const result = await sut.handle(input);

    expect(result).toHaveProperty("summary");
    expect(result).toHaveProperty("pieChartData");
    expect(result).toHaveProperty("barChartData");
    expect(result).toHaveProperty("timeSeriesData");
    expect(result).toHaveProperty("scatterData");
    expect(result).toHaveProperty("customFieldPieCharts");
    expect(result).toHaveProperty("topTransactions");
    expect(result).toHaveProperty("transactionHistogram");
    expect(result).toHaveProperty("goalProgressData");
    expect(result).toHaveProperty("detailedData");
    expect(result.summary.totalCategories).toBe(1);
    expect(result.summary.totalMonthlyRecords).toBe(1);
    expect(result.summary.totalTransactions).toBe(2);
    expect(userRepositorySpy.findOne).toHaveBeenCalledWith({
      id: input.userId,
    });
    expect(userRepositorySpy.findOne).toHaveBeenCalledTimes(1);
    expect(categoryRepositorySpy.findByUserId).toHaveBeenCalledWith({
      userId: input.userId,
    });
    expect(categoryRepositorySpy.findByUserId).toHaveBeenCalledTimes(1);
    expect(monthlyRecordRepositorySpy.findByUserId).toHaveBeenCalledTimes(1);
  });

  test("should return dashboard data for specific category when categoryId is provided", async () => {
    const {
      sut,
      userRepositorySpy,
      categoryRepositorySpy,
      monthlyRecordRepositorySpy,
    } = makeSut();
    const input = {
      userId: String(mockUser.id),
      categoryId: mockCategoryWithRecordType.id,
    };

    const result = await sut.handle(input);

    expect(result).toHaveProperty("summary");
    expect(result.filters.categoryId).toBe(mockCategoryWithRecordType.id);
    expect(userRepositorySpy.findOne).toHaveBeenCalledWith({
      id: input.userId,
    });
    expect(userRepositorySpy.findOne).toHaveBeenCalledTimes(1);
    expect(categoryRepositorySpy.findByIdAndUserId).toHaveBeenCalledWith({
      id: input.categoryId,
      userId: input.userId,
    });
    expect(categoryRepositorySpy.findByIdAndUserId).toHaveBeenCalledTimes(1);
    expect(monthlyRecordRepositorySpy.findByUserId).toHaveBeenCalledTimes(1);
  });

  test("should filter records by date range when startDate and endDate are provided", async () => {
    const { sut, userRepositorySpy, categoryRepositorySpy } = makeSut();
    const input = {
      userId: String(mockUser.id),
      startDate: "2024-01-01",
      endDate: "2024-12-31",
    };

    const result = await sut.handle(input);

    expect(result).toHaveProperty("summary");
    expect(result.filters.startDate).toBe("2024-01-01");
    expect(result.filters.endDate).toBe("2024-12-31");
    expect(userRepositorySpy.findOne).toHaveBeenCalledWith({
      id: input.userId,
    });
    expect(userRepositorySpy.findOne).toHaveBeenCalledTimes(1);
    expect(categoryRepositorySpy.findByUserId).toHaveBeenCalledTimes(1);
  });

  test("should group data by specified groupBy parameter", async () => {
    const { sut, userRepositorySpy, categoryRepositorySpy } = makeSut();
    const input = {
      userId: String(mockUser.id),
      groupBy: "week" as const,
    };

    const result = await sut.handle(input);

    expect(result).toHaveProperty("timeSeriesData");
    expect(result.filters.groupBy).toBe("week");
    expect(userRepositorySpy.findOne).toHaveBeenCalledWith({
      id: input.userId,
    });
    expect(userRepositorySpy.findOne).toHaveBeenCalledTimes(1);
    expect(categoryRepositorySpy.findByUserId).toHaveBeenCalledTimes(1);
  });

  test("should throw ValidationError if userId is empty", async () => {
    const { sut, userRepositorySpy, categoryRepositorySpy } = makeSut();
    const input = { userId: "" };

    await expect(sut.handle(input)).rejects.toThrow(ValidationError);
    expect(userRepositorySpy.findOne).not.toHaveBeenCalled();
    expect(categoryRepositorySpy.findByUserId).not.toHaveBeenCalled();
  });

  test("should throw NotFoundError if user is not found", async () => {
    const { sut, userRepositorySpy, categoryRepositorySpy } = makeSut();
    const input = { userId: String(mockUser.id) };
    userRepositorySpy.findOne.mockResolvedValue(null);

    await expect(sut.handle(input)).rejects.toThrow(
      new NotFoundError(`Usuário com ID ${mockUser.id} não encontrado`)
    );
    expect(userRepositorySpy.findOne).toHaveBeenCalledWith({
      id: input.userId,
    });
    expect(userRepositorySpy.findOne).toHaveBeenCalledTimes(1);
    expect(categoryRepositorySpy.findByUserId).not.toHaveBeenCalled();
  });

  test("should throw NotFoundError if no categories are found", async () => {
    const { sut, userRepositorySpy, categoryRepositorySpy } = makeSut();
    const input = { userId: String(mockUser.id) };
    userRepositorySpy.findOne.mockResolvedValue(mockUser);
    categoryRepositorySpy.findByUserId.mockResolvedValue({
      categories: [],
      total: 0,
    });

    await expect(sut.handle(input)).rejects.toThrow(
      new NotFoundError("Nenhuma categoria encontrada")
    );
    expect(userRepositorySpy.findOne).toHaveBeenCalledWith({
      id: input.userId,
    });
    expect(userRepositorySpy.findOne).toHaveBeenCalledTimes(1);
    expect(categoryRepositorySpy.findByUserId).toHaveBeenCalledWith({
      userId: input.userId,
    });
    expect(categoryRepositorySpy.findByUserId).toHaveBeenCalledTimes(1);
  });

  test("should return empty dashboard data when no monthly records are found", async () => {
    const {
      sut,
      userRepositorySpy,
      categoryRepositorySpy,
      monthlyRecordRepositorySpy,
    } = makeSut();
    const input = { userId: String(mockUser.id) };
    userRepositorySpy.findOne.mockResolvedValue(mockUser);
    monthlyRecordRepositorySpy.findByUserId.mockResolvedValue({
      records: [],
      total: 0,
    });

    const result = await sut.handle(input);

    expect(result).toHaveProperty("summary");
    expect(result.summary.totalMonthlyRecords).toBe(0);
    expect(result.summary.totalTransactions).toBe(0);
    expect(result.detailedData[0].monthlyRecords).toHaveLength(0);
    expect(userRepositorySpy.findOne).toHaveBeenCalledWith({
      id: input.userId,
    });
    expect(userRepositorySpy.findOne).toHaveBeenCalledTimes(1);
    expect(categoryRepositorySpy.findByUserId).toHaveBeenCalledTimes(1);
    expect(monthlyRecordRepositorySpy.findByUserId).toHaveBeenCalledTimes(1);
  });

  test("should calculate correct summary statistics", async () => {
    const { sut } = makeSut();
    const input = { userId: String(mockUser.id) };

    const result = await sut.handle(input);

    expect(result.summary).toHaveProperty("totalCategories");
    expect(result.summary).toHaveProperty("totalMonthlyRecords");
    expect(result.summary).toHaveProperty("totalTransactions");
    expect(result.summary).toHaveProperty("totalAmount");
    expect(result.summary).toHaveProperty("averageTransactionAmount");
    expect(result.summary).toHaveProperty("categoryBreakdown");
    expect(result.summary.totalTransactions).toBe(2);
    expect(result.summary.totalAmount).toBe(125.5);
  });

  test("should generate pie chart data correctly", async () => {
    const { sut } = makeSut();
    const input = { userId: String(mockUser.id) };

    const result = await sut.handle(input);

    expect(result.pieChartData).toBeInstanceOf(Array);
    expect(result.pieChartData.length).toBeGreaterThan(0);
    expect(result.pieChartData[0]).toHaveProperty("name");
    expect(result.pieChartData[0]).toHaveProperty("value");
    expect(result.pieChartData[0]).toHaveProperty("percentage");
  });

  test("should generate bar chart data correctly", async () => {
    const { sut } = makeSut();
    const input = { userId: String(mockUser.id) };

    const result = await sut.handle(input);

    expect(result.barChartData).toBeInstanceOf(Array);
    expect(result.barChartData.length).toBeGreaterThan(0);
    expect(result.barChartData[0]).toHaveProperty("category");
    expect(result.barChartData[0]).toHaveProperty("amount");
    expect(result.barChartData[0]).toHaveProperty("transactions");
    expect(result.barChartData[0]).toHaveProperty("records");
  });

  test("should generate time series data correctly", async () => {
    const { sut } = makeSut();
    const input = { userId: String(mockUser.id) };

    const result = await sut.handle(input);

    expect(result.timeSeriesData).toBeInstanceOf(Array);
    expect(result.timeSeriesData.length).toBeGreaterThan(0);
    expect(result.timeSeriesData[0]).toHaveProperty("period");
    expect(result.timeSeriesData[0]).toHaveProperty("periodLabel");
    expect(result.timeSeriesData[0]).toHaveProperty("totalAmount");
    expect(result.timeSeriesData[0]).toHaveProperty("totalTransactions");
  });

  test("should generate top transactions correctly", async () => {
    const { sut } = makeSut();
    const input = { userId: String(mockUser.id) };

    const result = await sut.handle(input);

    expect(result.topTransactions).toBeInstanceOf(Array);
    expect(result.topTransactions.length).toBeLessThanOrEqual(5);
    if (result.topTransactions.length > 0) {
      expect(result.topTransactions[0]).toHaveProperty("id");
      expect(result.topTransactions[0]).toHaveProperty("title");
      expect(result.topTransactions[0]).toHaveProperty("amount");
      expect(result.topTransactions[0]).toHaveProperty("date");
      expect(result.topTransactions[0]).toHaveProperty("categoryName");
    }
  });

  test("should generate goal progress data correctly", async () => {
    const { sut } = makeSut();
    const input = { userId: String(mockUser.id) };

    const result = await sut.handle(input);

    expect(result.goalProgressData).toBeInstanceOf(Array);
    expect(result.goalProgressData.length).toBeGreaterThan(0);
    expect(result.goalProgressData[0]).toHaveProperty("recordId");
    expect(result.goalProgressData[0]).toHaveProperty("title");
    expect(result.goalProgressData[0]).toHaveProperty("goal");
    expect(result.goalProgressData[0]).toHaveProperty("currentTotal");
    expect(result.goalProgressData[0]).toHaveProperty("progress");
  });

  test("should throw ServerError on unexpected error", async () => {
    const { sut, userRepositorySpy, categoryRepositorySpy } = makeSut();
    const input = { userId: String(mockUser.id) };
    userRepositorySpy.findOne.mockRejectedValue(new Error("Database error"));

    await expect(sut.handle(input)).rejects.toThrow(
      new ServerError("Falha na busca dos dados do dashboard: Database error")
    );
    expect(userRepositorySpy.findOne).toHaveBeenCalledWith({
      id: input.userId,
    });
    expect(userRepositorySpy.findOne).toHaveBeenCalledTimes(1);
    expect(categoryRepositorySpy.findByUserId).not.toHaveBeenCalled();
  });
});
