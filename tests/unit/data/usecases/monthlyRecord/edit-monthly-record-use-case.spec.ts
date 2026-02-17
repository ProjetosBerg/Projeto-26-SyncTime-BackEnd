import { MonthlyRecordRepositoryProtocol } from "@/infra/db/interfaces/monthlyRecordRepositoryProtocol";
import { UserRepositoryProtocol } from "@/infra/db/interfaces/userRepositoryProtocol";
import { CategoryRepositoryProtocol } from "@/infra/db/interfaces/categoryRepositoryProtocol";
import { NotFoundError } from "@/data/errors/NotFoundError";
import { BusinessRuleError } from "@/data/errors/BusinessRuleError";
import { ServerError } from "@/data/errors/ServerError";
import { MonthlyRecordModel } from "@/domain/models/postgres/MonthlyRecordModel";
import { ValidationError } from "yup";
import { mockMonthlyRecord } from "@/tests/unit/mocks/monthlyRecord/mockMonthlyRecord";
import { mockCategory } from "@/tests/unit/mocks/category/mockCategory";
import { mockUser } from "@/tests/unit/mocks/user/mockUser";
import { EditMonthlyRecordUseCase } from "@/data/usecases/monthlyRecord/editMonthlyRecordUseCase";
import { NotificationRepositoryProtocol } from "@/infra/db/interfaces/notificationRepositoryProtocol";

export const makeMonthlyRecordRepository =
  (): jest.Mocked<MonthlyRecordRepositoryProtocol> => ({
    create: jest.fn(),
    findOneMonthlyRecord: jest.fn().mockResolvedValue(null),
    findByUserId: jest.fn(),
    findByIdAndUserId: jest.fn().mockResolvedValue(mockMonthlyRecord),
    update: jest.fn().mockResolvedValue({
      ...mockMonthlyRecord,
      title: "Updated Budget",
    }),
    delete: jest.fn(),
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

  const sut = new EditMonthlyRecordUseCase(
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

describe("EditMonthlyRecordUseCase", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should update a monthly record successfully", async () => {
    const {
      sut,
      monthlyRecordRepositorySpy,
      userRepositorySpy,
      categoryRepositorySpy,
    } = makeSut();
    userRepositorySpy.findOne.mockResolvedValue(mockUser);
    monthlyRecordRepositorySpy.findByIdAndUserId.mockResolvedValue(
      mockMonthlyRecord
    );
    const updatedRecord = { ...mockMonthlyRecord, title: "Updated Budget" };
    monthlyRecordRepositorySpy.update.mockResolvedValue(updatedRecord);

    const input = {
      monthlyRecordId: mockMonthlyRecord.id,
      userId: mockMonthlyRecord.user_id,
      title: "Updated Budget",
      description: mockMonthlyRecord.description,
      goal: mockMonthlyRecord.goal,
      initial_balance: mockMonthlyRecord.initial_balance,
      categoryId: mockMonthlyRecord.category_id,
    };

    const result = await sut.handle(input);

    expect(result).toEqual(updatedRecord);
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
    expect(monthlyRecordRepositorySpy.update).toHaveBeenCalledWith({
      id: input.monthlyRecordId,
      title: input.title,
      description: input.description,
      goal: input.goal,
      initial_balance: input.initial_balance,
      categoryId: input.categoryId,
      userId: input.userId,
    });

    expect(monthlyRecordRepositorySpy.update).toHaveBeenCalledTimes(1);
  });

  test("should throw ValidationError if id is empty", async () => {
    const {
      sut,
      monthlyRecordRepositorySpy,
      userRepositorySpy,
      categoryRepositorySpy,
    } = makeSut();
    const input = {
      monthlyRecordId: "",
      userId: mockMonthlyRecord.user_id,
      categoryId: mockMonthlyRecord.category_id,
      title: "Updated Budget",
    };

    await expect(sut.handle(input)).rejects.toThrow(ValidationError);
    await expect(sut.handle(input)).rejects.toMatchObject({
      errors: expect.arrayContaining(["ID do registro mensal é obrigatório"]),
    });
    expect(userRepositorySpy.findOne).not.toHaveBeenCalled();
    expect(monthlyRecordRepositorySpy.findByIdAndUserId).not.toHaveBeenCalled();
    expect(categoryRepositorySpy.findByIdAndUserId).not.toHaveBeenCalled();
    expect(monthlyRecordRepositorySpy.findByIdAndUserId).not.toHaveBeenCalled();
    expect(monthlyRecordRepositorySpy.update).not.toHaveBeenCalled();
  });

  test("should throw ValidationError if categoryId is empty", async () => {
    const {
      sut,
      monthlyRecordRepositorySpy,
      userRepositorySpy,
      categoryRepositorySpy,
    } = makeSut();
    const input = {
      monthlyRecordId: mockMonthlyRecord.id,
      userId: mockMonthlyRecord.user_id,
      categoryId: "",
      title: "Updated Budget",
    };

    await expect(sut.handle(input)).rejects.toThrow(ValidationError);
    await expect(sut.handle(input)).rejects.toMatchObject({
      errors: expect.arrayContaining(["ID da Categoria é obrigatória"]),
    });
    expect(userRepositorySpy.findOne).not.toHaveBeenCalled();
    expect(monthlyRecordRepositorySpy.findByIdAndUserId).not.toHaveBeenCalled();
    expect(categoryRepositorySpy.findByIdAndUserId).not.toHaveBeenCalled();
    expect(monthlyRecordRepositorySpy.findByIdAndUserId).not.toHaveBeenCalled();
    expect(monthlyRecordRepositorySpy.update).not.toHaveBeenCalled();
  });

  test("should throw ValidationError if userId is empty", async () => {
    const {
      sut,
      monthlyRecordRepositorySpy,
      userRepositorySpy,
      categoryRepositorySpy,
    } = makeSut();
    const input = {
      monthlyRecordId: mockMonthlyRecord.id,
      userId: "",
      title: "Updated Budget",
      categoryId: mockMonthlyRecord.category_id,
    };

    await expect(sut.handle(input)).rejects.toThrow(ValidationError);
    await expect(sut.handle(input)).rejects.toMatchObject({
      errors: expect.arrayContaining(["ID do Usuário é obrigatório"]),
    });
    expect(userRepositorySpy.findOne).not.toHaveBeenCalled();
    expect(monthlyRecordRepositorySpy.findByIdAndUserId).not.toHaveBeenCalled();
    expect(categoryRepositorySpy.findByIdAndUserId).not.toHaveBeenCalled();
    expect(monthlyRecordRepositorySpy.findByIdAndUserId).not.toHaveBeenCalled();
    expect(monthlyRecordRepositorySpy.update).not.toHaveBeenCalled();
  });

  test("should throw ValidationError if title is too short", async () => {
    const {
      sut,
      monthlyRecordRepositorySpy,
      userRepositorySpy,
      categoryRepositorySpy,
    } = makeSut();
    const input = {
      monthlyRecordId: mockMonthlyRecord.id,
      userId: mockMonthlyRecord.user_id,
      categoryId: mockMonthlyRecord.category_id,
      title: "A",
    };

    await expect(sut.handle(input)).rejects.toThrow(ValidationError);
    await expect(sut.handle(input)).rejects.toMatchObject({
      errors: expect.arrayContaining([
        "Título deve ter no mínimo 2 caracteres",
      ]),
    });
    expect(userRepositorySpy.findOne).not.toHaveBeenCalled();
    expect(monthlyRecordRepositorySpy.findByIdAndUserId).not.toHaveBeenCalled();
    expect(categoryRepositorySpy.findByIdAndUserId).not.toHaveBeenCalled();
    expect(monthlyRecordRepositorySpy.findByIdAndUserId).not.toHaveBeenCalled();
    expect(monthlyRecordRepositorySpy.update).not.toHaveBeenCalled();
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
      monthlyRecordId: mockMonthlyRecord.id,
      userId: mockMonthlyRecord.user_id,
      categoryId: mockMonthlyRecord.category_id,
      title: "Updated Budget",
    };

    await expect(sut.handle(input)).rejects.toThrow(
      new NotFoundError(`Usuário com ID ${input.userId} não encontrado`)
    );
    expect(userRepositorySpy.findOne).toHaveBeenCalledWith({
      id: input.userId,
    });
    expect(userRepositorySpy.findOne).toHaveBeenCalledTimes(1);
    expect(monthlyRecordRepositorySpy.findByIdAndUserId).not.toHaveBeenCalled();
    expect(categoryRepositorySpy.findByIdAndUserId).not.toHaveBeenCalled();
    expect(monthlyRecordRepositorySpy.findByIdAndUserId).not.toHaveBeenCalled();
    expect(monthlyRecordRepositorySpy.update).not.toHaveBeenCalled();
  });

  test("should throw NotFoundError if monthly record does not exist", async () => {
    const {
      sut,
      monthlyRecordRepositorySpy,
      userRepositorySpy,
      categoryRepositorySpy,
    } = makeSut();
    userRepositorySpy.findOne.mockResolvedValue(mockUser);
    monthlyRecordRepositorySpy.findByIdAndUserId.mockResolvedValue(null);

    const input = {
      monthlyRecordId: mockMonthlyRecord.id,
      userId: mockMonthlyRecord.user_id,
      categoryId: mockMonthlyRecord.category_id,
      title: "Updated Budget",
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
    expect(categoryRepositorySpy.findByIdAndUserId).not.toHaveBeenCalled();
    expect(monthlyRecordRepositorySpy.update).not.toHaveBeenCalled();
  });

  test("should throw NotFoundError if category does not exist", async () => {
    const {
      sut,
      monthlyRecordRepositorySpy,
      userRepositorySpy,
      categoryRepositorySpy,
    } = makeSut();
    userRepositorySpy.findOne.mockResolvedValue(mockUser);
    monthlyRecordRepositorySpy.findByIdAndUserId.mockResolvedValue(
      mockMonthlyRecord
    );
    categoryRepositorySpy.findByIdAndUserId.mockResolvedValue(null);

    const input = {
      monthlyRecordId: mockMonthlyRecord.id,
      userId: mockMonthlyRecord.user_id,
      title: "Updated Budget",
      categoryId: "new-category-id",
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
    expect(monthlyRecordRepositorySpy.update).not.toHaveBeenCalled();
  });

  test("should throw BusinessRuleError if another monthly record exists for the new category, month, and year", async () => {
    const {
      sut,
      monthlyRecordRepositorySpy,
      userRepositorySpy,
      categoryRepositorySpy,
    } = makeSut();
    userRepositorySpy.findOne.mockResolvedValue(mockUser);
    monthlyRecordRepositorySpy.findByIdAndUserId.mockResolvedValue(
      mockMonthlyRecord
    );
    categoryRepositorySpy.findByIdAndUserId.mockResolvedValue({
      ...mockCategory,
      id: "new-category-id",
    });
    const existingRecord = { ...mockMonthlyRecord, id: "different-id" };
    monthlyRecordRepositorySpy.findOneMonthlyRecord.mockResolvedValue(
      existingRecord
    );

    const input = {
      monthlyRecordId: mockMonthlyRecord.id,
      userId: mockMonthlyRecord.user_id,
      title: "Updated Budget",
      categoryId: "new-category-id",
    };

    await expect(sut.handle(input)).rejects.toThrow(
      new BusinessRuleError(
        `Já existe um registro mensal para esta categoria, usuário, mês ${mockMonthlyRecord.month} e ano ${mockMonthlyRecord.year}`
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
      month: mockMonthlyRecord.month,
      year: mockMonthlyRecord.year,
    });
    expect(
      monthlyRecordRepositorySpy.findOneMonthlyRecord
    ).toHaveBeenCalledTimes(1);
    expect(monthlyRecordRepositorySpy.update).not.toHaveBeenCalled();
  });
  test("should throw ServerError on unexpected error", async () => {
    const {
      sut,
      monthlyRecordRepositorySpy,
      userRepositorySpy,
      categoryRepositorySpy,
    } = makeSut();
    userRepositorySpy.findOne.mockResolvedValue(mockUser);
    monthlyRecordRepositorySpy.findByIdAndUserId.mockResolvedValue(
      mockMonthlyRecord
    );
    monthlyRecordRepositorySpy.findOneMonthlyRecord.mockResolvedValue(null);
    monthlyRecordRepositorySpy.update.mockRejectedValue(
      new Error("Database error")
    );

    const input = {
      monthlyRecordId: mockMonthlyRecord.id,
      userId: mockMonthlyRecord.user_id,
      title: "Updated Budget",
      categoryId: mockMonthlyRecord.category_id,
    };

    await expect(sut.handle(input)).rejects.toThrow(
      new ServerError("Falha na atualização do registro mensal: Database error")
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
      month: mockMonthlyRecord.month,
      year: mockMonthlyRecord.year,
    });
    expect(
      monthlyRecordRepositorySpy.findOneMonthlyRecord
    ).toHaveBeenCalledTimes(1);
    expect(monthlyRecordRepositorySpy.update).toHaveBeenCalledWith({
      id: input.monthlyRecordId,
      title: input.title,
      categoryId: input.categoryId,
      userId: input.userId,
    });
    expect(monthlyRecordRepositorySpy.update).toHaveBeenCalledTimes(1);
  });
});
