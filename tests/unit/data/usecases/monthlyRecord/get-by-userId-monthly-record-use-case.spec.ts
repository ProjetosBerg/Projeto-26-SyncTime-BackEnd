import { MonthlyRecordRepositoryProtocol } from "@/infra/db/interfaces/monthlyRecordRepositoryProtocol";
import { UserRepositoryProtocol } from "@/infra/db/interfaces/userRepositoryProtocol";
import { NotFoundError } from "@/data/errors/NotFoundError";
import { ServerError } from "@/data/errors/ServerError";
import { MonthlyRecordModel } from "@/domain/models/postgres/MonthlyRecordModel";
import { ValidationError } from "yup";
import { mockMonthlyRecord } from "@/tests/unit/mocks/monthlyRecord/mockMonthlyRecord";
import { GetByUserIdMonthlyRecordUseCase } from "@/data/usecases/monthlyRecord/getByUserIdMonthlyRecordUseCase";
import { mockUser } from "@/tests/unit/mocks/user/mockUser";
import { mockCategory } from "@/tests/unit/mocks/category/mockCategory";

export const makeMonthlyRecordRepository =
  (): jest.Mocked<MonthlyRecordRepositoryProtocol> => ({
    create: jest.fn(),
    findOneMonthlyRecord: jest.fn(),
    findByUserId: jest.fn().mockResolvedValue([mockMonthlyRecord]),
    ...({} as any),
  });

export const makeUserRepository = (): jest.Mocked<UserRepositoryProtocol> => ({
  findOne: jest.fn().mockResolvedValue(mockUser),
  ...({} as any),
});

const makeSut = () => {
  const monthlyRecordRepositorySpy = makeMonthlyRecordRepository();
  const userRepositorySpy = makeUserRepository();
  const sut = new GetByUserIdMonthlyRecordUseCase(
    monthlyRecordRepositorySpy,
    userRepositorySpy
  );

  return {
    sut,
    monthlyRecordRepositorySpy,
    userRepositorySpy,
  };
};

describe("GetByUserIdMonthlyRecordUseCase", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should retrieve monthly records successfully", async () => {
    const { sut, monthlyRecordRepositorySpy, userRepositorySpy } = makeSut();
    userRepositorySpy.findOne.mockResolvedValue(mockUser);
    monthlyRecordRepositorySpy.findByUserId.mockResolvedValue({
      records: [mockMonthlyRecord],
      total: 1,
    });

    const input = {
      userId: mockMonthlyRecord.user_id,
      categoryId: mockCategory.id,
    };

    const result = await sut.handle(input);

    expect(result).toEqual({ records: [mockMonthlyRecord], total: 1 });
    expect(userRepositorySpy.findOne).toHaveBeenCalledWith({
      id: input.userId,
    });
    expect(userRepositorySpy.findOne).toHaveBeenCalledTimes(1);
    expect(monthlyRecordRepositorySpy.findByUserId).toHaveBeenCalledWith({
      userId: input.userId,
      categoryId: input.categoryId,
      page: 1,
      limit: 10,
      filters: [],
      sortBy: "title",
      order: "ASC",
    });
    expect(monthlyRecordRepositorySpy.findByUserId).toHaveBeenCalledTimes(1);
  });

  test("should return empty array if no monthly records exist", async () => {
    const { sut, monthlyRecordRepositorySpy, userRepositorySpy } = makeSut();
    userRepositorySpy.findOne.mockResolvedValue(mockUser);
    monthlyRecordRepositorySpy.findByUserId.mockResolvedValue({
      records: [],
      total: 0,
    });

    const input = {
      userId: mockMonthlyRecord.user_id,
      categoryId: mockCategory.id,
    };

    const result = await sut.handle(input);

    expect(result).toEqual({ records: [], total: 0 });
    expect(userRepositorySpy.findOne).toHaveBeenCalledWith({
      id: input.userId,
    });
    expect(userRepositorySpy.findOne).toHaveBeenCalledTimes(1);
    expect(monthlyRecordRepositorySpy.findByUserId).toHaveBeenCalledWith({
      userId: input.userId,
      categoryId: input.categoryId,
      page: 1,
      limit: 10,
      filters: [],
      sortBy: "title",
      order: "ASC",
    });
    expect(monthlyRecordRepositorySpy.findByUserId).toHaveBeenCalledTimes(1);
  });

  test("should throw ValidationError if userId is empty", async () => {
    const { sut, monthlyRecordRepositorySpy, userRepositorySpy } = makeSut();
    const input = { userId: "", categoryId: mockCategory.id };

    await expect(sut.handle(input)).rejects.toThrow(ValidationError);
    await expect(sut.handle(input)).rejects.toMatchObject({
      errors: expect.arrayContaining(["ID do Usuário é obrigatório"]),
    });
    expect(userRepositorySpy.findOne).not.toHaveBeenCalled();
    expect(monthlyRecordRepositorySpy.findByUserId).not.toHaveBeenCalled();
  });

  test("should throw ValidationError if categoryId is empty", async () => {
    const { sut, monthlyRecordRepositorySpy, userRepositorySpy } = makeSut();
    const input = { userId: mockMonthlyRecord.user_id, categoryId: "" };

    await expect(sut.handle(input)).rejects.toThrow(ValidationError);
    await expect(sut.handle(input)).rejects.toMatchObject({
      errors: expect.arrayContaining(["ID da categoria é obrigatório"]),
    });
    expect(userRepositorySpy.findOne).not.toHaveBeenCalled();
    expect(monthlyRecordRepositorySpy.findByUserId).not.toHaveBeenCalled();
  });

  test("should throw NotFoundError if user does not exist", async () => {
    const { sut, monthlyRecordRepositorySpy, userRepositorySpy } = makeSut();
    userRepositorySpy.findOne.mockResolvedValue(null);

    const input = {
      userId: mockMonthlyRecord.user_id,
      categoryId: mockCategory.id,
    };

    await expect(sut.handle(input)).rejects.toThrow(
      new NotFoundError(`Usuário com ID ${input.userId} não encontrado`)
    );
    expect(userRepositorySpy.findOne).toHaveBeenCalledWith({
      id: input.userId,
    });
    expect(userRepositorySpy.findOne).toHaveBeenCalledTimes(1);
    expect(monthlyRecordRepositorySpy.findByUserId).not.toHaveBeenCalled();
  });

  test("should throw ServerError on unexpected error", async () => {
    const { sut, monthlyRecordRepositorySpy, userRepositorySpy } = makeSut();
    userRepositorySpy.findOne.mockResolvedValue(mockUser);
    monthlyRecordRepositorySpy.findByUserId.mockRejectedValue(
      new Error("Database error")
    );

    const input = {
      userId: mockMonthlyRecord.user_id,
      categoryId: mockCategory.id,
    };

    await expect(sut.handle(input)).rejects.toThrow(
      new ServerError("Falha na busca dos registros mensais: Database error")
    );
    expect(userRepositorySpy.findOne).toHaveBeenCalledWith({
      id: input.userId,
    });
    expect(userRepositorySpy.findOne).toHaveBeenCalledTimes(1);
    expect(monthlyRecordRepositorySpy.findByUserId).toHaveBeenCalledWith({
      userId: input.userId,
      categoryId: input.categoryId,
      page: 1,
      limit: 10,
      filters: [],
      sortBy: "title",
      order: "ASC",
    });
    expect(monthlyRecordRepositorySpy.findByUserId).toHaveBeenCalledTimes(1);
  });
});
