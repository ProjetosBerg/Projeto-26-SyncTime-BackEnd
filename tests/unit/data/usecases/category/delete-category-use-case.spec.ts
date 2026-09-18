import { CategoryRepositoryProtocol } from "@/infra/db/interfaces/categoryRepositoryProtocol";
import { UserRepositoryProtocol } from "@/infra/db/interfaces/userRepositoryProtocol";
import { NotFoundError } from "@/data/errors/NotFoundError";
import { ServerError } from "@/data/errors/ServerError";
import { mockCategory } from "@/tests/unit/mocks/category/mockCategory";
import { ValidationError } from "yup";
import { DeleteCategoryUseCase } from "@/data/usecases/category/deleteCategoryUseCase";
import { mockUser } from "@/tests/unit/mocks/user/mockUser";
import { CustomFieldsRepositoryProtocol } from "@/infra/db/interfaces/customFieldsRepositoryProtocol";
import { TransactionCustomFieldRepositoryProtocol } from "@/infra/db/interfaces/TransactionCustomFieldRepositoryProtocol";

export const makeCategoryRepository =
  (): jest.Mocked<CategoryRepositoryProtocol> => ({
    create: jest.fn(),
    findByNameAndUserId: jest.fn(),
    findByIdAndUserId: jest.fn().mockResolvedValue(mockCategory),
    deleteCategory: jest.fn().mockResolvedValue(undefined),
    ...({} as any),
  });

export const makeUserRepository = (): jest.Mocked<UserRepositoryProtocol> => ({
  findOne: jest.fn().mockResolvedValue(mockUser),
  ...({} as any),
});

export const makeCustomFieldsRepository =
  (): jest.Mocked<CustomFieldsRepositoryProtocol> => ({
    deleteByCategoryId: jest.fn().mockResolvedValue(["custom-field-123"]),
    ...({} as any),
  });

export const makeTransactionCustomFieldRepository =
  (): jest.Mocked<TransactionCustomFieldRepositoryProtocol> => ({
    deleteByTransactionIds: jest.fn().mockResolvedValue(undefined),
    deleteByCustomFieldIds: jest.fn().mockResolvedValue(undefined),
    ...({} as any),
  });

const makeSut = () => {
  const categoryRepositorySpy = makeCategoryRepository();
  const userRepositorySpy = makeUserRepository();
  const customFieldsRepositorySpy = makeCustomFieldsRepository();
  const transactionCustomFieldRepositorySpy =
    makeTransactionCustomFieldRepository();
  const sut = new DeleteCategoryUseCase(
    categoryRepositorySpy,
    userRepositorySpy,
    customFieldsRepositorySpy,
    transactionCustomFieldRepositorySpy
  );

  return {
    sut,
    categoryRepositorySpy,
    userRepositorySpy,
    customFieldsRepositorySpy,
    transactionCustomFieldRepositorySpy,
  };
};

describe("DeleteCategoryUseCase", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should delete a category successfully", async () => {
    const {
      sut,
      categoryRepositorySpy,
      userRepositorySpy,
      customFieldsRepositorySpy,
      transactionCustomFieldRepositorySpy,
    } = makeSut();
    userRepositorySpy.findOne.mockResolvedValue(mockUser);
    categoryRepositorySpy.findByIdAndUserId.mockResolvedValue({
      ...mockCategory,
      transactions: [{ id: "transaction-123" } as any],
    });
    categoryRepositorySpy.deleteCategory.mockResolvedValue(undefined);

    const input = {
      categoryId: mockCategory.id!,
      userId: mockUser.id,
    };

    await sut.handle(input);

    expect(userRepositorySpy.findOne).toHaveBeenCalledWith({
      id: input.userId,
    });
    expect(userRepositorySpy.findOne).toHaveBeenCalledTimes(1);
    expect(categoryRepositorySpy.deleteCategory).toHaveBeenCalledWith({
      id: input.categoryId,
      userId: input.userId,
    });
    expect(categoryRepositorySpy.deleteCategory).toHaveBeenCalledTimes(1);
    expect(customFieldsRepositorySpy.deleteByCategoryId).toHaveBeenCalledWith({
      category_id: input.categoryId,
      user_id: input.userId,
    });
    expect(
      transactionCustomFieldRepositorySpy.deleteByTransactionIds
    ).toHaveBeenCalledWith({
      transaction_ids: ["transaction-123"],
      user_id: input.userId,
    });
    expect(
      transactionCustomFieldRepositorySpy.deleteByCustomFieldIds
    ).toHaveBeenCalledWith({
      custom_field_ids: ["custom-field-123"],
      user_id: input.userId,
    });
  });

  test("should throw ValidationError if id is missing", async () => {
    const { sut, categoryRepositorySpy, userRepositorySpy } = makeSut();
    const input = {
      categoryId: "",
      userId: mockUser.id,
    };

    await expect(sut.handle(input)).rejects.toThrow(ValidationError);
    await expect(sut.handle(input)).rejects.toMatchObject({
      errors: expect.arrayContaining(["ID da categoria é obrigatório"]),
    });
    expect(userRepositorySpy.findOne).not.toHaveBeenCalled();
    expect(categoryRepositorySpy.deleteCategory).not.toHaveBeenCalled();
  });

  test("should throw ValidationError if userId is missing", async () => {
    const { sut, categoryRepositorySpy, userRepositorySpy } = makeSut();
    const input = {
      categoryId: mockCategory.id!,
      userId: "",
    };

    await expect(sut.handle(input)).rejects.toThrow(ValidationError);
    await expect(sut.handle(input)).rejects.toMatchObject({
      errors: expect.arrayContaining(["ID do Usuário é obrigatório"]),
    });
    expect(userRepositorySpy.findOne).not.toHaveBeenCalled();
    expect(categoryRepositorySpy.deleteCategory).not.toHaveBeenCalled();
  });

  test("should throw NotFoundError if user does not exist", async () => {
    const { sut, categoryRepositorySpy, userRepositorySpy } = makeSut();
    userRepositorySpy.findOne.mockResolvedValue(null);

    const input = {
      categoryId: mockCategory.id!,
      userId: mockCategory.user_id,
    };

    await expect(sut.handle(input)).rejects.toThrow(
      new NotFoundError(`Usuário com ID ${input.userId} não encontrado`)
    );
    expect(userRepositorySpy.findOne).toHaveBeenCalledWith({
      id: input.userId,
    });
    expect(userRepositorySpy.findOne).toHaveBeenCalledTimes(1);
    expect(categoryRepositorySpy.deleteCategory).not.toHaveBeenCalled();
  });

  test("should throw NotFoundError if category does not exist", async () => {
    const { sut, categoryRepositorySpy, userRepositorySpy } = makeSut();
    userRepositorySpy.findOne.mockResolvedValue(mockUser);
    categoryRepositorySpy.findByIdAndUserId.mockResolvedValue(null);

    const input = {
      categoryId: mockCategory.id!,
      userId: mockCategory.user_id,
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
    expect(categoryRepositorySpy.deleteCategory).not.toHaveBeenCalled();
  });

  test("should throw ServerError on unexpected error", async () => {
    const { sut, categoryRepositorySpy, userRepositorySpy } = makeSut();
    userRepositorySpy.findOne.mockResolvedValue(mockUser);
    categoryRepositorySpy.deleteCategory.mockRejectedValue(
      new Error("Database error")
    );

    const input = {
      categoryId: mockCategory.id!,
      userId: mockUser.id,
    };

    await expect(sut.handle(input)).rejects.toThrow(
      new ServerError("Falha ao deletar categoria: Database error")
    );
    expect(userRepositorySpy.findOne).toHaveBeenCalledWith({
      id: input.userId,
    });
    expect(userRepositorySpy.findOne).toHaveBeenCalledTimes(1);
    expect(categoryRepositorySpy.deleteCategory).toHaveBeenCalledWith({
      id: input.categoryId,
      userId: input.userId,
    });
    expect(categoryRepositorySpy.deleteCategory).toHaveBeenCalledTimes(1);
  });
});
