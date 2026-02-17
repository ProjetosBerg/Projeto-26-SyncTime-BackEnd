import { CategoryRepositoryProtocol } from "@/infra/db/interfaces/categoryRepositoryProtocol";
import { UserRepositoryProtocol } from "@/infra/db/interfaces/userRepositoryProtocol";
import { NotFoundError } from "@/data/errors/NotFoundError";
import { ServerError } from "@/data/errors/ServerError";
import { ValidationError } from "yup";
import { mockCategoryWithRecordType } from "@/tests/unit/mocks/category/mockCategory";
import { mockUser } from "@/tests/unit/mocks/user/mockUser";
import { GetByUserIdCategoryUseCase } from "@/data/usecases/category/getByUserIdCategoryUseCase";

export const makeCategoryRepository =
  (): jest.Mocked<CategoryRepositoryProtocol> => ({
    create: jest.fn(),
    findByNameAndUserId: jest.fn(),
    findByUserId: jest.fn().mockResolvedValue([mockCategoryWithRecordType]),
    ...({} as any),
  });

export const makeUserRepository = (): jest.Mocked<UserRepositoryProtocol> => ({
  findOne: jest.fn().mockResolvedValue(mockUser),
  ...({} as any),
});

const makeSut = () => {
  const categoryRepositorySpy = makeCategoryRepository();
  const userRepositorySpy = makeUserRepository();
  const sut = new GetByUserIdCategoryUseCase(
    categoryRepositorySpy,
    userRepositorySpy
  );

  return {
    sut,
    categoryRepositorySpy,
    userRepositorySpy,
  };
};

describe("GetByUserIdCategoryUseCase", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should return categories successfully", async () => {
    const { sut, categoryRepositorySpy, userRepositorySpy } = makeSut();
    const input = { userId: mockUser.id };
    const expectedCategories = [
      {
        id: mockCategoryWithRecordType.id,
        name: mockCategoryWithRecordType.name,
        description: mockCategoryWithRecordType.description,
        type: mockCategoryWithRecordType.type,
        record_type_id: mockCategoryWithRecordType.record_type_id,
        record_type_name: mockCategoryWithRecordType.record_type_name,
        record_type_icone: mockCategoryWithRecordType.record_type_icone,
        user_id: mockCategoryWithRecordType.user_id,
        created_at: mockCategoryWithRecordType.created_at,
        updated_at: mockCategoryWithRecordType.updated_at,
      },
    ];

    userRepositorySpy.findOne.mockResolvedValue(mockUser);
    categoryRepositorySpy.findByUserId.mockResolvedValue({
      categories: [mockCategoryWithRecordType],
      total: 1,
    });

    const result = await sut.handle(input);

    expect(result).toEqual({
      categories: expectedCategories,
      total: 1,
    });
    expect(userRepositorySpy.findOne).toHaveBeenCalledWith({
      id: input.userId,
    });
    expect(userRepositorySpy.findOne).toHaveBeenCalledTimes(1);
    expect(categoryRepositorySpy.findByUserId).toHaveBeenCalledWith({
      userId: input.userId,
      page: 1,
      limit: 10,
      search: undefined,
      sortBy: "name",
      order: "ASC",
    });
    expect(categoryRepositorySpy.findByUserId).toHaveBeenCalledTimes(1);
  });

  test("should throw ValidationError if userId is empty", async () => {
    const { sut, categoryRepositorySpy, userRepositorySpy } = makeSut();
    const input = { userId: "" };

    await expect(sut.handle(input)).rejects.toThrow(ValidationError);
    await expect(sut.handle(input)).rejects.toMatchObject({
      errors: expect.arrayContaining(["ID do Usuário é obrigatório"]),
    });
    expect(userRepositorySpy.findOne).not.toHaveBeenCalled();
    expect(categoryRepositorySpy.findByUserId).not.toHaveBeenCalled();
  });

  test("should throw NotFoundError if user is not found", async () => {
    const { sut, categoryRepositorySpy, userRepositorySpy } = makeSut();
    const input = { userId: mockUser.id };
    userRepositorySpy.findOne.mockResolvedValue(null);

    await expect(sut.handle(input)).rejects.toThrow(
      new NotFoundError("User não encontrado")
    );
    expect(userRepositorySpy.findOne).toHaveBeenCalledWith({
      id: input.userId,
    });
    expect(userRepositorySpy.findOne).toHaveBeenCalledTimes(1);
    expect(categoryRepositorySpy.findByUserId).not.toHaveBeenCalled();
  });

  test("should throw NotFoundError if no categories are found", async () => {
    const { sut, categoryRepositorySpy, userRepositorySpy } = makeSut();
    const input = { userId: mockUser.id };
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
      search: undefined,
      limit: 10,
      page: 1,
      sortBy: "name",
      order: "ASC",
    });
    expect(categoryRepositorySpy.findByUserId).toHaveBeenCalledTimes(1);
  });

  test("should throw ServerError on unexpected error", async () => {
    const { sut, categoryRepositorySpy, userRepositorySpy } = makeSut();
    const input = { userId: mockUser.id };
    userRepositorySpy.findOne.mockRejectedValue(new Error("Database error"));

    await expect(sut.handle(input)).rejects.toThrow(
      new ServerError("Falha na busca das categorias: Database error")
    );
    expect(userRepositorySpy.findOne).toHaveBeenCalledWith({
      id: input.userId,
    });
    expect(userRepositorySpy.findOne).toHaveBeenCalledTimes(1);
    expect(categoryRepositorySpy.findByUserId).not.toHaveBeenCalled();
  });
});
