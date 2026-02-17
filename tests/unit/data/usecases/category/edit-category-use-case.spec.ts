import { CategoryRepositoryProtocol } from "@/infra/db/interfaces/categoryRepositoryProtocol";
import { UserRepositoryProtocol } from "@/infra/db/interfaces/userRepositoryProtocol";
import { RecordTypesRepositoryProtocol } from "@/infra/db/interfaces/recordTypesRepositoryProtocol";
import { NotFoundError } from "@/data/errors/NotFoundError";
import { BusinessRuleError } from "@/data/errors/BusinessRuleError";
import { ServerError } from "@/data/errors/ServerError";
import { mockCategory } from "@/tests/unit/mocks/category/mockCategory";
import { ValidationError } from "yup";
import { mockRecordType } from "@/tests/unit/mocks/recordTypes/mockRecordTypes";
import { EditCategoryUseCase } from "@/data/usecases/category/editCategoryUseCase";
import { mockUser } from "@/tests/unit/mocks/user/mockUser";

export const makeCategoryRepository =
  (): jest.Mocked<CategoryRepositoryProtocol> => ({
    create: jest.fn(),
    findByNameAndUserId: jest.fn().mockResolvedValue(null),
    findByIdAndUserId: jest.fn(),
    delete: jest.fn(),
    updateCategory: jest.fn().mockResolvedValue(mockCategory),
    ...({} as any),
  });

export const makeUserRepository = (): jest.Mocked<UserRepositoryProtocol> => ({
  findOne: jest.fn().mockResolvedValue(mockUser),
  ...({} as any),
});

export const makeRecordTypeRepository =
  (): jest.Mocked<RecordTypesRepositoryProtocol> => ({
    create: jest.fn(),
    findByNameAndUserId: jest.fn(),
    findByUserId: jest.fn(),
    findByIdAndUserId: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findByIdRecordType: jest.fn().mockResolvedValue(mockRecordType),
    ...({} as any),
  });

const makeSut = () => {
  const categoryRepositorySpy = makeCategoryRepository();
  const userRepositorySpy = makeUserRepository();
  const recordTypeRepositorySpy = makeRecordTypeRepository();
  const sut = new EditCategoryUseCase(
    categoryRepositorySpy,
    recordTypeRepositorySpy,
    userRepositorySpy
  );

  return {
    sut,
    categoryRepositorySpy,
    userRepositorySpy,
    recordTypeRepositorySpy,
  };
};

describe("EditCategoryUseCase", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should update a category successfully", async () => {
    const {
      sut,
      categoryRepositorySpy,
      userRepositorySpy,
      recordTypeRepositorySpy,
    } = makeSut();
    userRepositorySpy.findOne.mockResolvedValue(mockUser);
    recordTypeRepositorySpy.findByIdRecordType.mockResolvedValue(
      mockRecordType
    );
    categoryRepositorySpy.findByNameAndUserId.mockResolvedValue(null);
    categoryRepositorySpy.updateCategory.mockResolvedValue(mockCategory);

    const input = {
      categoryId: mockCategory.id!,
      name: mockCategory.name,
      description: mockCategory.description,
      type: mockCategory.type,
      recordTypeId: mockCategory.record_type_id,
      userId: mockCategory.user_id,
    };

    const result = await sut.handle(input);

    expect(result).toEqual(mockCategory);
    expect(userRepositorySpy.findOne).toHaveBeenCalledWith({
      id: input.userId,
    });
    expect(userRepositorySpy.findOne).toHaveBeenCalledTimes(1);
    expect(recordTypeRepositorySpy.findByIdRecordType).toHaveBeenCalledWith({
      id: input.recordTypeId,
      userId: input.userId,
    });
    expect(recordTypeRepositorySpy.findByIdRecordType).toHaveBeenCalledTimes(1);
    expect(categoryRepositorySpy.findByNameAndUserId).toHaveBeenCalledWith({
      name: input.name,
      userId: input.userId,
      recordTypeId: input.recordTypeId,
    });
    expect(categoryRepositorySpy.findByNameAndUserId).toHaveBeenCalledTimes(1);
    expect(categoryRepositorySpy.updateCategory).toHaveBeenCalledWith({
      id: input.categoryId,
      name: input.name,
      description: input.description,
      type: input.type,
      recordTypeId: input.recordTypeId,
      userId: input.userId,
    });
    expect(categoryRepositorySpy.updateCategory).toHaveBeenCalledTimes(1);
  });

  test("should throw ValidationError if id is missing", async () => {
    const {
      sut,
      categoryRepositorySpy,
      userRepositorySpy,
      recordTypeRepositorySpy,
    } = makeSut();
    const input = {
      categoryId: "",
      name: mockCategory.name,
      description: mockCategory.description,
      type: mockCategory.type,
      recordTypeId: mockCategory.record_type_id,
      userId: mockCategory.user_id,
    };

    await expect(sut.handle(input)).rejects.toThrow(ValidationError);
    await expect(sut.handle(input)).rejects.toMatchObject({
      errors: expect.arrayContaining(["ID da categoria é obrigatório"]),
    });
    expect(userRepositorySpy.findOne).not.toHaveBeenCalled();
    expect(recordTypeRepositorySpy.findByIdRecordType).not.toHaveBeenCalled();
    expect(categoryRepositorySpy.findByNameAndUserId).not.toHaveBeenCalled();
    expect(categoryRepositorySpy.updateCategory).not.toHaveBeenCalled();
  });

  test("should throw ValidationError if name is too short", async () => {
    const {
      sut,
      categoryRepositorySpy,
      userRepositorySpy,
      recordTypeRepositorySpy,
    } = makeSut();
    const input = {
      categoryId: mockCategory.id!,
      name: "F",
      description: mockCategory.description,
      type: mockCategory.type,
      recordTypeId: mockCategory.record_type_id,
      userId: mockCategory.user_id,
    };

    await expect(sut.handle(input)).rejects.toThrow(ValidationError);
    await expect(sut.handle(input)).rejects.toMatchObject({
      errors: expect.arrayContaining(["Nome deve ter no mínimo 2 caracteres"]),
    });
    expect(userRepositorySpy.findOne).not.toHaveBeenCalled();
    expect(recordTypeRepositorySpy.findByIdRecordType).not.toHaveBeenCalled();
    expect(categoryRepositorySpy.findByNameAndUserId).not.toHaveBeenCalled();
    expect(categoryRepositorySpy.updateCategory).not.toHaveBeenCalled();
  });

  test("should throw ValidationError if recordTypeId is missing", async () => {
    const {
      sut,
      categoryRepositorySpy,
      userRepositorySpy,
      recordTypeRepositorySpy,
    } = makeSut();
    const input = {
      categoryId: mockCategory.id!,
      name: mockCategory.name,
      description: mockCategory.description,
      type: mockCategory.type,
      recordTypeId: undefined as any,
      userId: mockCategory.user_id,
    };

    await expect(sut.handle(input)).rejects.toThrow(ValidationError);
    await expect(sut.handle(input)).rejects.toMatchObject({
      errors: expect.arrayContaining(["ID do tipo de registro é obrigatório"]),
    });
    expect(userRepositorySpy.findOne).not.toHaveBeenCalled();
    expect(recordTypeRepositorySpy.findByIdRecordType).not.toHaveBeenCalled();
    expect(categoryRepositorySpy.findByNameAndUserId).not.toHaveBeenCalled();
    expect(categoryRepositorySpy.updateCategory).not.toHaveBeenCalled();
  });

  test("should throw ValidationError if userId is empty", async () => {
    const {
      sut,
      categoryRepositorySpy,
      userRepositorySpy,
      recordTypeRepositorySpy,
    } = makeSut();
    const input = {
      categoryId: mockCategory.id!,
      name: mockCategory.name,
      description: mockCategory.description,
      type: mockCategory.type,
      recordTypeId: mockCategory.record_type_id,
      userId: "",
    };

    await expect(sut.handle(input)).rejects.toThrow(ValidationError);
    await expect(sut.handle(input)).rejects.toMatchObject({
      errors: expect.arrayContaining(["ID do Usuário é obrigatório"]),
    });
    expect(userRepositorySpy.findOne).not.toHaveBeenCalled();
    expect(recordTypeRepositorySpy.findByIdRecordType).not.toHaveBeenCalled();
    expect(categoryRepositorySpy.findByNameAndUserId).not.toHaveBeenCalled();
    expect(categoryRepositorySpy.updateCategory).not.toHaveBeenCalled();
  });

  test("should throw NotFoundError if user does not exist", async () => {
    const {
      sut,
      categoryRepositorySpy,
      userRepositorySpy,
      recordTypeRepositorySpy,
    } = makeSut();
    userRepositorySpy.findOne.mockResolvedValue(null);

    const input = {
      categoryId: mockCategory.id!,
      name: mockCategory.name,
      description: mockCategory.description,
      type: mockCategory.type,
      recordTypeId: mockCategory.record_type_id,
      userId: mockCategory.user_id,
    };

    await expect(sut.handle(input)).rejects.toThrow(
      new NotFoundError(`Usuário com ID ${input.userId} não encontrado`)
    );
    expect(userRepositorySpy.findOne).toHaveBeenCalledWith({
      id: input.userId,
    });
    expect(userRepositorySpy.findOne).toHaveBeenCalledTimes(1);
    expect(recordTypeRepositorySpy.findByIdRecordType).not.toHaveBeenCalled();
    expect(categoryRepositorySpy.findByNameAndUserId).not.toHaveBeenCalled();
    expect(categoryRepositorySpy.updateCategory).not.toHaveBeenCalled();
  });

  test("should throw NotFoundError if record type does not exist", async () => {
    const {
      sut,
      categoryRepositorySpy,
      userRepositorySpy,
      recordTypeRepositorySpy,
    } = makeSut();
    userRepositorySpy.findOne.mockResolvedValue(mockUser);
    recordTypeRepositorySpy.findByIdRecordType.mockResolvedValue(null);

    const input = {
      categoryId: mockCategory.id!,
      name: mockCategory.name,
      description: mockCategory.description,
      type: mockCategory.type,
      recordTypeId: mockCategory.record_type_id,
      userId: mockCategory.user_id,
    };

    await expect(sut.handle(input)).rejects.toThrow(
      new NotFoundError(
        `Nenhum tipo de registro encontrado com o ID ${input.recordTypeId} para este usuário`
      )
    );
    expect(userRepositorySpy.findOne).toHaveBeenCalledWith({
      id: input.userId,
    });
    expect(userRepositorySpy.findOne).toHaveBeenCalledTimes(1);
    expect(recordTypeRepositorySpy.findByIdRecordType).toHaveBeenCalledWith({
      id: input.recordTypeId,
      userId: input.userId,
    });
    expect(recordTypeRepositorySpy.findByIdRecordType).toHaveBeenCalledTimes(1);
    expect(categoryRepositorySpy.findByNameAndUserId).not.toHaveBeenCalled();
    expect(categoryRepositorySpy.updateCategory).not.toHaveBeenCalled();
  });

  test("should throw BusinessRuleError if category name already exists for user and record type", async () => {
    const {
      sut,
      categoryRepositorySpy,
      userRepositorySpy,
      recordTypeRepositorySpy,
    } = makeSut();
    userRepositorySpy.findOne.mockResolvedValue(mockUser);
    recordTypeRepositorySpy.findByIdRecordType.mockResolvedValue(
      mockRecordType
    );
    const existingCategory = { ...mockCategory, id: "different-id" };
    categoryRepositorySpy.findByNameAndUserId.mockResolvedValue(
      existingCategory
    );

    const input = {
      categoryId: mockCategory.id!,
      name: mockCategory.name,
      description: mockCategory.description,
      type: mockCategory.type,
      recordTypeId: mockCategory.record_type_id,
      userId: mockCategory.user_id,
    };

    await expect(sut.handle(input)).rejects.toThrow(
      new BusinessRuleError(
        `Já existe uma categoria com o nome "${input.name}" para este usuário e tipo de registro`
      )
    );
    expect(userRepositorySpy.findOne).toHaveBeenCalledWith({
      id: input.userId,
    });
    expect(userRepositorySpy.findOne).toHaveBeenCalledTimes(1);
    expect(recordTypeRepositorySpy.findByIdRecordType).toHaveBeenCalledWith({
      id: input.recordTypeId,
      userId: input.userId,
    });
    expect(recordTypeRepositorySpy.findByIdRecordType).toHaveBeenCalledTimes(1);
    expect(categoryRepositorySpy.findByNameAndUserId).toHaveBeenCalledWith({
      name: input.name,
      userId: input.userId,
      recordTypeId: input.recordTypeId,
    });
    expect(categoryRepositorySpy.findByNameAndUserId).toHaveBeenCalledTimes(1);
    expect(categoryRepositorySpy.updateCategory).not.toHaveBeenCalled();
  });

  test("should throw NotFoundError if category does not exist", async () => {
    const {
      sut,
      categoryRepositorySpy,
      userRepositorySpy,
      recordTypeRepositorySpy,
    } = makeSut();
    userRepositorySpy.findOne.mockResolvedValue(mockUser);
    recordTypeRepositorySpy.findByIdRecordType.mockResolvedValue(
      mockRecordType
    );
    categoryRepositorySpy.findByNameAndUserId.mockResolvedValue(null);
    categoryRepositorySpy.updateCategory.mockRejectedValue(
      new NotFoundError(
        `Categoria com ID ${mockCategory.id} não encontrada para este usuário`
      )
    );

    const input = {
      categoryId: mockCategory.id!,
      name: mockCategory.name,
      description: mockCategory.description,
      type: mockCategory.type,
      recordTypeId: mockCategory.record_type_id,
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
    expect(recordTypeRepositorySpy.findByIdRecordType).toHaveBeenCalledWith({
      id: input.recordTypeId,
      userId: input.userId,
    });
    expect(recordTypeRepositorySpy.findByIdRecordType).toHaveBeenCalledTimes(1);
    expect(categoryRepositorySpy.findByNameAndUserId).toHaveBeenCalledWith({
      name: input.name,
      userId: input.userId,
      recordTypeId: input.recordTypeId,
    });
    expect(categoryRepositorySpy.findByNameAndUserId).toHaveBeenCalledTimes(1);
    expect(categoryRepositorySpy.updateCategory).toHaveBeenCalledWith({
      id: input.categoryId,
      name: input.name,
      description: input.description,
      type: input.type,
      recordTypeId: input.recordTypeId,
      userId: input.userId,
    });
    expect(categoryRepositorySpy.updateCategory).toHaveBeenCalledTimes(1);
  });

  test("should throw ServerError on unexpected error", async () => {
    const {
      sut,
      categoryRepositorySpy,
      userRepositorySpy,
      recordTypeRepositorySpy,
    } = makeSut();
    userRepositorySpy.findOne.mockResolvedValue(mockUser);
    recordTypeRepositorySpy.findByIdRecordType.mockResolvedValue(
      mockRecordType
    );
    categoryRepositorySpy.findByNameAndUserId.mockResolvedValue(null);
    categoryRepositorySpy.updateCategory.mockRejectedValue(
      new Error("Database error")
    );

    const input = {
      categoryId: mockCategory.id!,
      name: mockCategory.name,
      description: mockCategory.description,
      type: mockCategory.type,
      recordTypeId: mockCategory.record_type_id,
      userId: mockCategory.user_id,
    };

    await expect(sut.handle(input)).rejects.toThrow(
      new ServerError("Falha na atualização de categoria: Database error")
    );
    expect(userRepositorySpy.findOne).toHaveBeenCalledWith({
      id: input.userId,
    });
    expect(userRepositorySpy.findOne).toHaveBeenCalledTimes(1);
    expect(recordTypeRepositorySpy.findByIdRecordType).toHaveBeenCalledWith({
      id: input.recordTypeId,
      userId: input.userId,
    });
    expect(recordTypeRepositorySpy.findByIdRecordType).toHaveBeenCalledTimes(1);
    expect(categoryRepositorySpy.findByNameAndUserId).toHaveBeenCalledWith({
      name: input.name,
      userId: input.userId,
      recordTypeId: input.recordTypeId,
    });
    expect(categoryRepositorySpy.findByNameAndUserId).toHaveBeenCalledTimes(1);
    expect(categoryRepositorySpy.updateCategory).toHaveBeenCalledWith({
      id: input.categoryId,
      name: input.name,
      description: input.description,
      type: input.type,
      recordTypeId: input.recordTypeId,
      userId: input.userId,
    });
    expect(categoryRepositorySpy.updateCategory).toHaveBeenCalledTimes(1);
  });
});
