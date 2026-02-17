import { MonthlyRecordRepositoryProtocol } from "@/infra/db/interfaces/monthlyRecordRepositoryProtocol";
import { UserRepositoryProtocol } from "@/infra/db/interfaces/userRepositoryProtocol";
import { CategoryRepositoryProtocol } from "@/infra/db/interfaces/categoryRepositoryProtocol";
import { NotFoundError } from "@/data/errors/NotFoundError";
import { BusinessRuleError } from "@/data/errors/BusinessRuleError";
import { ServerError } from "@/data/errors/ServerError";
import { MonthlyRecordModel } from "@/domain/models/postgres/MonthlyRecordModel";
import { ValidationError } from "yup";
import { mockCategory } from "@/tests/unit/mocks/category/mockCategory";
import { mockMonthlyRecord } from "@/tests/unit/mocks/monthlyRecord/mockMonthlyRecord";
import { CreateMonthlyRecordUseCase } from "@/data/usecases/monthlyRecord/createMonthlyRecordUseCase";
import { mockUser } from "@/tests/unit/mocks/user/mockUser";
import { Category } from "@/domain/entities/postgres/Category";
import { User } from "@/domain/entities/postgres/User";
import { NotificationRepositoryProtocol } from "@/infra/db/interfaces/notificationRepositoryProtocol";

export const makeMonthlyRecordRepository =
  (): jest.Mocked<MonthlyRecordRepositoryProtocol> => ({
    create: jest.fn().mockResolvedValue(mockMonthlyRecord),
    findOneMonthlyRecord: jest.fn().mockResolvedValue(null),
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

export const makeNotificationRepository =
  (): jest.Mocked<NotificationRepositoryProtocol> => ({
    create: jest.fn().mockResolvedValue(null),
    countNewByUserId: jest.fn().mockResolvedValue(0),
    ...({} as any),
  });

const makeSut = () => {
  const monthlyRecordRepositorySpy = makeMonthlyRecordRepository();
  const userRepositorySpy = makeUserRepository();
  const categoryRepositorySpy = makeCategoryRepository();
  const notificationRepositorySpy = makeNotificationRepository();
  const sut = new CreateMonthlyRecordUseCase(
    monthlyRecordRepositorySpy,
    userRepositorySpy,
    categoryRepositorySpy,
    notificationRepositorySpy
  );

  return {
    sut,
    monthlyRecordRepositorySpy,
    userRepositorySpy,
    categoryRepositorySpy,
  };
};

describe("CreateMonthlyRecordUseCase", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should create a monthly record successfully", async () => {
    const {
      sut,
      monthlyRecordRepositorySpy,
      userRepositorySpy,
      categoryRepositorySpy,
    } = makeSut();
    userRepositorySpy.findOne.mockResolvedValue(mockUser);
    categoryRepositorySpy.findByIdAndUserId.mockResolvedValue(mockCategory);
    monthlyRecordRepositorySpy.findOneMonthlyRecord.mockResolvedValue(null);
    monthlyRecordRepositorySpy.create.mockResolvedValue(mockMonthlyRecord);

    const input = {
      title: mockMonthlyRecord.title,
      description: mockMonthlyRecord.description,
      goal: mockMonthlyRecord.goal,
      status: mockMonthlyRecord.status,
      initial_balance: mockMonthlyRecord.initial_balance,
      month: mockMonthlyRecord.month,
      year: mockMonthlyRecord.year,
      categoryId: mockMonthlyRecord.category_id,
      userId: mockMonthlyRecord.user_id,
    };

    const result = await sut.handle(input);

    expect(result).toEqual(mockMonthlyRecord);
    expect(userRepositorySpy.findOne).toHaveBeenCalledWith({
      id: input.userId,
    });
    expect(userRepositorySpy.findOne).toHaveBeenCalledTimes(1);
    expect(categoryRepositorySpy.findByIdAndUserId).toHaveBeenCalledWith({
      id: input.categoryId,
      userId: input.userId,
    });
    expect(categoryRepositorySpy.findByIdAndUserId).toHaveBeenCalledTimes(1);
    expect(
      monthlyRecordRepositorySpy.findOneMonthlyRecord
    ).toHaveBeenCalledWith({
      userId: input.userId,
      categoryId: input.categoryId,
      month: input.month,
      year: input.year,
    });
    expect(
      monthlyRecordRepositorySpy.findOneMonthlyRecord
    ).toHaveBeenCalledTimes(1);
    expect(monthlyRecordRepositorySpy.create).toHaveBeenCalledWith(input);
    expect(monthlyRecordRepositorySpy.create).toHaveBeenCalledTimes(1);
  });

  test("should throw ValidationError if title is empty", async () => {
    const {
      sut,
      monthlyRecordRepositorySpy,
      userRepositorySpy,
      categoryRepositorySpy,
    } = makeSut();
    const input = {
      title: "",
      description: mockMonthlyRecord.description,
      goal: mockMonthlyRecord.goal,
      initial_balance: mockMonthlyRecord.initial_balance,
      month: mockMonthlyRecord.month,
      status: mockMonthlyRecord.status,
      year: mockMonthlyRecord.year,
      categoryId: mockMonthlyRecord.category_id,
      userId: mockMonthlyRecord.user_id,
    };

    await expect(sut.handle(input)).rejects.toThrow(ValidationError);
    await expect(sut.handle(input)).rejects.toMatchObject({
      errors: expect.arrayContaining(["Título é obrigatório"]),
    });
    expect(userRepositorySpy.findOne).not.toHaveBeenCalled();
    expect(categoryRepositorySpy.findByIdAndUserId).not.toHaveBeenCalled();
    expect(
      monthlyRecordRepositorySpy.findOneMonthlyRecord
    ).not.toHaveBeenCalled();
    expect(monthlyRecordRepositorySpy.create).not.toHaveBeenCalled();
  });

  test("should throw ValidationError if title is too short", async () => {
    const {
      sut,
      monthlyRecordRepositorySpy,
      userRepositorySpy,
      categoryRepositorySpy,
    } = makeSut();
    const input = {
      title: "A",
      description: mockMonthlyRecord.description,
      goal: mockMonthlyRecord.goal,
      status: mockMonthlyRecord.status,
      initial_balance: mockMonthlyRecord.initial_balance,
      month: mockMonthlyRecord.month,
      year: mockMonthlyRecord.year,
      categoryId: mockMonthlyRecord.category_id,
      userId: mockMonthlyRecord.user_id,
    };

    await expect(sut.handle(input)).rejects.toThrow(ValidationError);
    await expect(sut.handle(input)).rejects.toMatchObject({
      errors: expect.arrayContaining([
        "Título deve ter no mínimo 2 caracteres",
      ]),
    });
    expect(userRepositorySpy.findOne).not.toHaveBeenCalled();
    expect(categoryRepositorySpy.findByIdAndUserId).not.toHaveBeenCalled();
    expect(
      monthlyRecordRepositorySpy.findOneMonthlyRecord
    ).not.toHaveBeenCalled();
    expect(monthlyRecordRepositorySpy.create).not.toHaveBeenCalled();
  });

  test("should throw ValidationError if goal is empty", async () => {
    const {
      sut,
      monthlyRecordRepositorySpy,
      userRepositorySpy,
      categoryRepositorySpy,
    } = makeSut();
    const input = {
      title: mockMonthlyRecord.title,
      description: mockMonthlyRecord.description,
      goal: "",
      status: mockMonthlyRecord.status,
      initial_balance: mockMonthlyRecord.initial_balance,
      month: mockMonthlyRecord.month,
      year: mockMonthlyRecord.year,
      categoryId: mockMonthlyRecord.category_id,
      userId: mockMonthlyRecord.user_id,
    };

    await expect(sut.handle(input)).rejects.toThrow(ValidationError);
    await expect(sut.handle(input)).rejects.toMatchObject({
      errors: expect.arrayContaining(["Meta é obrigatória"]),
    });
    expect(userRepositorySpy.findOne).not.toHaveBeenCalled();
    expect(categoryRepositorySpy.findByIdAndUserId).not.toHaveBeenCalled();
    expect(
      monthlyRecordRepositorySpy.findOneMonthlyRecord
    ).not.toHaveBeenCalled();
    expect(monthlyRecordRepositorySpy.create).not.toHaveBeenCalled();
  });

  test("should throw ValidationError if status is empty", async () => {
    const {
      sut,
      monthlyRecordRepositorySpy,
      userRepositorySpy,
      categoryRepositorySpy,
    } = makeSut();
    const input = {
      title: mockMonthlyRecord.title,
      description: mockMonthlyRecord.description,
      goal: mockMonthlyRecord.goal,
      status: "",
      initial_balance: mockMonthlyRecord.initial_balance,
      month: mockMonthlyRecord.month,
      year: mockMonthlyRecord.year,
      categoryId: mockMonthlyRecord.category_id,
      userId: mockMonthlyRecord.user_id,
    };

    await expect(sut.handle(input)).rejects.toThrow(ValidationError);
    await expect(sut.handle(input)).rejects.toMatchObject({
      errors: expect.arrayContaining(["Status é obrigatório"]),
    });
    expect(userRepositorySpy.findOne).not.toHaveBeenCalled();
    expect(categoryRepositorySpy.findByIdAndUserId).not.toHaveBeenCalled();
    expect(
      monthlyRecordRepositorySpy.findOneMonthlyRecord
    ).not.toHaveBeenCalled();
    expect(monthlyRecordRepositorySpy.create).not.toHaveBeenCalled();
  });

  test("should throw ValidationError if month is invalid", async () => {
    const {
      sut,
      monthlyRecordRepositorySpy,
      userRepositorySpy,
      categoryRepositorySpy,
    } = makeSut();
    const input = {
      title: mockMonthlyRecord.title,
      description: mockMonthlyRecord.description,
      goal: mockMonthlyRecord.goal,
      initial_balance: mockMonthlyRecord.initial_balance,
      status: mockMonthlyRecord.status,
      month: 13,
      year: mockMonthlyRecord.year,
      categoryId: mockMonthlyRecord.category_id,
      userId: mockMonthlyRecord.user_id,
    };

    await expect(sut.handle(input)).rejects.toThrow(ValidationError);
    await expect(sut.handle(input)).rejects.toMatchObject({
      errors: expect.arrayContaining(["Mês deve estar entre 1 e 12"]),
    });
    expect(userRepositorySpy.findOne).not.toHaveBeenCalled();
    expect(categoryRepositorySpy.findByIdAndUserId).not.toHaveBeenCalled();
    expect(
      monthlyRecordRepositorySpy.findOneMonthlyRecord
    ).not.toHaveBeenCalled();
    expect(monthlyRecordRepositorySpy.create).not.toHaveBeenCalled();
  });

  test("should throw ValidationError if year is invalid", async () => {
    const {
      sut,
      monthlyRecordRepositorySpy,
      userRepositorySpy,
      categoryRepositorySpy,
    } = makeSut();
    const input = {
      title: mockMonthlyRecord.title,
      description: mockMonthlyRecord.description,
      goal: mockMonthlyRecord.goal,
      initial_balance: mockMonthlyRecord.initial_balance,
      month: mockMonthlyRecord.month,
      year: 1999,
      categoryId: mockMonthlyRecord.category_id,
      userId: mockMonthlyRecord.user_id,
      status: mockMonthlyRecord.status,
    };

    await expect(sut.handle(input)).rejects.toThrow(ValidationError);
    await expect(sut.handle(input)).rejects.toMatchObject({
      errors: expect.arrayContaining(["Ano deve ser maior ou igual a 2000"]),
    });
    expect(userRepositorySpy.findOne).not.toHaveBeenCalled();
    expect(categoryRepositorySpy.findByIdAndUserId).not.toHaveBeenCalled();
    expect(
      monthlyRecordRepositorySpy.findOneMonthlyRecord
    ).not.toHaveBeenCalled();
    expect(monthlyRecordRepositorySpy.create).not.toHaveBeenCalled();
  });

  test("should throw ValidationError if categoryId is missing", async () => {
    const {
      sut,
      monthlyRecordRepositorySpy,
      userRepositorySpy,
      categoryRepositorySpy,
    } = makeSut();
    const input = {
      title: mockMonthlyRecord.title,
      description: mockMonthlyRecord.description,
      goal: mockMonthlyRecord.goal,
      status: mockMonthlyRecord.status,
      initial_balance: mockMonthlyRecord.initial_balance,
      month: mockMonthlyRecord.month,
      year: mockMonthlyRecord.year,
      categoryId: "",
      userId: mockMonthlyRecord.user_id,
    };

    await expect(sut.handle(input)).rejects.toThrow(ValidationError);
    await expect(sut.handle(input)).rejects.toMatchObject({
      errors: expect.arrayContaining(["ID da categoria é obrigatório"]),
    });
    expect(userRepositorySpy.findOne).not.toHaveBeenCalled();
    expect(categoryRepositorySpy.findByIdAndUserId).not.toHaveBeenCalled();
    expect(
      monthlyRecordRepositorySpy.findOneMonthlyRecord
    ).not.toHaveBeenCalled();
    expect(monthlyRecordRepositorySpy.create).not.toHaveBeenCalled();
  });

  test("should throw ValidationError if userId is missing", async () => {
    const {
      sut,
      monthlyRecordRepositorySpy,
      userRepositorySpy,
      categoryRepositorySpy,
    } = makeSut();
    const input = {
      title: mockMonthlyRecord.title,
      description: mockMonthlyRecord.description,
      goal: mockMonthlyRecord.goal,
      status: mockMonthlyRecord.status,
      initial_balance: mockMonthlyRecord.initial_balance,
      month: mockMonthlyRecord.month,
      year: mockMonthlyRecord.year,
      categoryId: mockMonthlyRecord.category_id,
      userId: "",
    };

    await expect(sut.handle(input)).rejects.toThrow(ValidationError);
    await expect(sut.handle(input)).rejects.toMatchObject({
      errors: expect.arrayContaining(["Usuário é obrigatório"]),
    });
    expect(userRepositorySpy.findOne).not.toHaveBeenCalled();
    expect(categoryRepositorySpy.findByIdAndUserId).not.toHaveBeenCalled();
    expect(
      monthlyRecordRepositorySpy.findOneMonthlyRecord
    ).not.toHaveBeenCalled();
    expect(monthlyRecordRepositorySpy.create).not.toHaveBeenCalled();
  });

  test("should throw NotFoundError if user does not exist", async () => {
    const {
      sut,
      monthlyRecordRepositorySpy,
      userRepositorySpy,
      categoryRepositorySpy,
    } = makeSut();
    userRepositorySpy.findOne.mockResolvedValue(null);

    const input = {
      title: mockMonthlyRecord.title,
      description: mockMonthlyRecord.description,
      goal: mockMonthlyRecord.goal,
      status: mockMonthlyRecord.status,
      initial_balance: mockMonthlyRecord.initial_balance,
      month: mockMonthlyRecord.month,
      year: mockMonthlyRecord.year,
      categoryId: mockMonthlyRecord.category_id,
      userId: mockMonthlyRecord.user_id,
    };

    await expect(sut.handle(input)).rejects.toThrow(
      new NotFoundError(`Usuário com ID ${input.userId} não encontrado`)
    );
    expect(userRepositorySpy.findOne).toHaveBeenCalledWith({
      id: input.userId,
    });
    expect(userRepositorySpy.findOne).toHaveBeenCalledTimes(1);
    expect(categoryRepositorySpy.findByIdAndUserId).not.toHaveBeenCalled();
    expect(
      monthlyRecordRepositorySpy.findOneMonthlyRecord
    ).not.toHaveBeenCalled();
    expect(monthlyRecordRepositorySpy.create).not.toHaveBeenCalled();
  });

  test("should throw NotFoundError if category does not exist", async () => {
    const {
      sut,
      monthlyRecordRepositorySpy,
      userRepositorySpy,
      categoryRepositorySpy,
    } = makeSut();
    userRepositorySpy.findOne.mockResolvedValue(mockUser);
    categoryRepositorySpy.findByIdAndUserId.mockResolvedValue(null);

    const input = {
      title: mockMonthlyRecord.title,
      description: mockMonthlyRecord.description,
      goal: mockMonthlyRecord.goal,
      status: mockMonthlyRecord.status,
      initial_balance: mockMonthlyRecord.initial_balance,
      month: mockMonthlyRecord.month,
      year: mockMonthlyRecord.year,
      categoryId: mockMonthlyRecord.category_id,
      userId: mockMonthlyRecord.user_id,
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
    expect(
      monthlyRecordRepositorySpy.findOneMonthlyRecord
    ).not.toHaveBeenCalled();
    expect(monthlyRecordRepositorySpy.create).not.toHaveBeenCalled();
  });

  test("should throw BusinessRuleError if monthly record already exists for user, category, month, and year", async () => {
    const {
      sut,
      monthlyRecordRepositorySpy,
      userRepositorySpy,
      categoryRepositorySpy,
    } = makeSut();
    userRepositorySpy.findOne.mockResolvedValue(mockUser);
    categoryRepositorySpy.findByIdAndUserId.mockResolvedValue(mockCategory);
    monthlyRecordRepositorySpy.findOneMonthlyRecord.mockResolvedValue(
      mockMonthlyRecord
    );

    const input = {
      title: mockMonthlyRecord.title,
      description: mockMonthlyRecord.description,
      goal: mockMonthlyRecord.goal,
      initial_balance: mockMonthlyRecord.initial_balance,
      status: mockMonthlyRecord.status,
      month: mockMonthlyRecord.month,
      year: mockMonthlyRecord.year,
      categoryId: mockMonthlyRecord.category_id,
      userId: mockMonthlyRecord.user_id,
    };

    await expect(sut.handle(input)).rejects.toThrow(
      new BusinessRuleError(
        `Já existe um registro mensal para esta categoria, usuário, mês ${input.month} e ano ${input.year}`
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
    expect(
      monthlyRecordRepositorySpy.findOneMonthlyRecord
    ).toHaveBeenCalledWith({
      userId: input.userId,
      categoryId: input.categoryId,
      month: input.month,
      year: input.year,
    });
    expect(
      monthlyRecordRepositorySpy.findOneMonthlyRecord
    ).toHaveBeenCalledTimes(1);
    expect(monthlyRecordRepositorySpy.create).not.toHaveBeenCalled();
  });

  test("should throw ServerError on unexpected error", async () => {
    const {
      sut,
      monthlyRecordRepositorySpy,
      userRepositorySpy,
      categoryRepositorySpy,
    } = makeSut();
    userRepositorySpy.findOne.mockResolvedValue(mockUser);
    categoryRepositorySpy.findByIdAndUserId.mockResolvedValue(mockCategory);
    monthlyRecordRepositorySpy.findOneMonthlyRecord.mockRejectedValue(
      new Error("Database error")
    );

    const input = {
      title: mockMonthlyRecord.title,
      description: mockMonthlyRecord.description,
      goal: mockMonthlyRecord.goal,
      initial_balance: mockMonthlyRecord.initial_balance,
      status: mockMonthlyRecord.status,
      month: mockMonthlyRecord.month,
      year: mockMonthlyRecord.year,
      categoryId: mockMonthlyRecord.category_id,
      userId: mockMonthlyRecord.user_id,
    };

    await expect(sut.handle(input)).rejects.toThrow(
      new ServerError("Falha no cadastro de registro mensal: Database error")
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
    expect(
      monthlyRecordRepositorySpy.findOneMonthlyRecord
    ).toHaveBeenCalledWith({
      userId: input.userId,
      categoryId: input.categoryId,
      month: input.month,
      year: input.year,
    });
    expect(
      monthlyRecordRepositorySpy.findOneMonthlyRecord
    ).toHaveBeenCalledTimes(1);
    expect(monthlyRecordRepositorySpy.create).not.toHaveBeenCalled();
  });
});
