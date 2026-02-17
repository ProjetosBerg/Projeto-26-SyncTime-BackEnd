import { CategoryRepositoryProtocol } from "@/infra/db/interfaces/categoryRepositoryProtocol";
import { UserRepositoryProtocol } from "@/infra/db/interfaces/userRepositoryProtocol";
import { NotFoundError } from "@/data/errors/NotFoundError";
import { ServerError } from "@/data/errors/ServerError";
import { mockCategory } from "@/tests/unit/mocks/category/mockCategory";
import { ValidationError } from "yup";
import { GetByIdCategoryUseCase } from "@/data/usecases/category/getByIdCategoryUseCase";
import { mockUser } from "@/tests/unit/mocks/user/mockUser";

export const makeCategoryRepository =
  (): jest.Mocked<CategoryRepositoryProtocol> => ({
    create: jest.fn(),
    findByNameAndUserId: jest.fn(),
    findByIdAndUserId: jest.fn().mockResolvedValue(mockCategory),
    ...({} as any),
  });

export const makeUserRepository = (): jest.Mocked<UserRepositoryProtocol> => ({
  findOne: jest.fn().mockResolvedValue(mockUser),

  ...({} as any),
});

const makeSut = () => {
  const categoryRepositorySpy = makeCategoryRepository();
  const userRepositorySpy = makeUserRepository();
  const sut = new GetByIdCategoryUseCase(
    categoryRepositorySpy,
    userRepositorySpy
  );

  return {
    sut,
    categoryRepositorySpy,
    userRepositorySpy,
  };
};

describe("GetByIdCategoryUseCase", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should retrieve a category successfully", async () => {
    const { sut, categoryRepositorySpy, userRepositorySpy } = makeSut();
    userRepositorySpy.findOne.mockResolvedValue(mockUser);
    categoryRepositorySpy.findByIdAndUserId.mockResolvedValue(mockCategory);

    const input = {
      categoryId: mockCategory.id!,
      userId: mockUser.id,
    };

    const result = await sut.handle(input);

    expect(result).toEqual(mockCategory);
    expect(userRepositorySpy.findOne).toHaveBeenCalledWith({
      id: input.userId,
    });
    expect(userRepositorySpy.findOne).toHaveBeenCalledTimes(1);
    expect(categoryRepositorySpy.findByIdAndUserId).toHaveBeenCalledWith({
      id: input.categoryId,
      userId: input.userId,
    });
    expect(categoryRepositorySpy.findByIdAndUserId).toHaveBeenCalledTimes(1);
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
    expect(categoryRepositorySpy.findByIdAndUserId).not.toHaveBeenCalled();
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
    expect(categoryRepositorySpy.findByIdAndUserId).not.toHaveBeenCalled();
  });

  test("should throw NotFoundError if user does not exist", async () => {
    const { sut, categoryRepositorySpy, userRepositorySpy } = makeSut();
    userRepositorySpy.findOne.mockResolvedValue(null);

    const input = {
      categoryId: mockCategory.id!,
      userId: mockUser.id,
    };

    await expect(sut.handle(input)).rejects.toThrow(
      new NotFoundError(`Usuário com ID ${input.userId} não encontrado`)
    );
    expect(userRepositorySpy.findOne).toHaveBeenCalledWith({
      id: input.userId,
    });
    expect(userRepositorySpy.findOne).toHaveBeenCalledTimes(1);
    expect(categoryRepositorySpy.findByIdAndUserId).not.toHaveBeenCalled();
  });

  test("should throw NotFoundError if category does not exist", async () => {
    const { sut, categoryRepositorySpy, userRepositorySpy } = makeSut();
    userRepositorySpy.findOne.mockResolvedValue(mockUser);
    categoryRepositorySpy.findByIdAndUserId.mockResolvedValue(null);

    const input = {
      categoryId: mockCategory.id!,
      userId: mockUser.id,
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
  });

  test("should throw ServerError on unexpected error", async () => {
    const { sut, categoryRepositorySpy, userRepositorySpy } = makeSut();
    userRepositorySpy.findOne.mockRejectedValue(new Error("Database error"));

    const input = {
      categoryId: mockCategory.id!,
      userId: mockUser.id,
    };

    await expect(sut.handle(input)).rejects.toThrow(
      new ServerError("Falha na busca das categorias: Database error")
    );
    expect(userRepositorySpy.findOne).toHaveBeenCalledWith({
      id: input.userId,
    });
    expect(userRepositorySpy.findOne).toHaveBeenCalledTimes(1);
    expect(categoryRepositorySpy.findByIdAndUserId).not.toHaveBeenCalled();
  });
});
