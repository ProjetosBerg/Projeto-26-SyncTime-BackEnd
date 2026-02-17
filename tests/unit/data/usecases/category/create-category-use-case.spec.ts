import { RecordTypesRepositoryProtocol } from "@/infra/db/interfaces/recordTypesRepositoryProtocol";
import { BusinessRuleError } from "@/data/errors/BusinessRuleError";
import { ServerError } from "@/data/errors/ServerError";
import { mockCategory } from "@/tests/unit/mocks/category/mockCategory";
import { ValidationError } from "yup";
import { CategoryRepositoryProtocol } from "@/infra/db/interfaces/categoryRepositoryProtocol";
import { mockRecordType } from "@/tests/unit/mocks/recordTypes/mockRecordTypes";
import { CreateCategoryUseCase } from "@/data/usecases/category/createCategoryUseCase";

export const makeCategoryRepository =
  (): jest.Mocked<CategoryRepositoryProtocol> => ({
    create: jest.fn().mockResolvedValue(mockCategory),
    findByNameAndUserId: jest.fn().mockResolvedValue(null),
    ...({} as any),
  });

export const makeRecordTypeRepository =
  (): jest.Mocked<RecordTypesRepositoryProtocol> => ({
    findByIdRecordType: jest.fn().mockResolvedValue(mockRecordType),
    ...({} as any),
  });

const makeSut = () => {
  const categoryRepositorySpy = makeCategoryRepository();
  const recordTypeRepositorySpy = makeRecordTypeRepository();
  const sut = new CreateCategoryUseCase(
    categoryRepositorySpy,
    recordTypeRepositorySpy
  );

  return {
    sut,
    categoryRepositorySpy,
    recordTypeRepositorySpy,
  };
};

describe("CreateCategoryUseCase", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should create a category successfully", async () => {
    const { sut, categoryRepositorySpy, recordTypeRepositorySpy } = makeSut();
    recordTypeRepositorySpy.findByIdRecordType.mockResolvedValue(
      mockRecordType
    );
    categoryRepositorySpy.findByNameAndUserId.mockResolvedValue(null);
    categoryRepositorySpy.create.mockResolvedValue(mockCategory);

    const input = {
      name: mockCategory.name,
      description: mockCategory.description,
      type: mockCategory.type,
      recordTypeId: mockCategory.record_type_id,
      userId: mockCategory.user_id,
    };

    const result = await sut.handle(input);

    expect(result).toEqual(mockCategory);
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
    expect(categoryRepositorySpy.create).toHaveBeenCalledWith(input);
    expect(categoryRepositorySpy.create).toHaveBeenCalledTimes(1);
  });

  test("should throw ValidationError if name is empty", async () => {
    const { sut, categoryRepositorySpy, recordTypeRepositorySpy } = makeSut();
    const input = {
      name: "",
      description: mockCategory.description,
      type: mockCategory.type,
      recordTypeId: mockCategory.record_type_id,
      userId: mockCategory.user_id,
    };

    await expect(sut.handle(input)).rejects.toThrow(ValidationError);
    await expect(sut.handle(input)).rejects.toMatchObject({
      errors: expect.arrayContaining(["Nome é obrigatório"]),
    });
    expect(recordTypeRepositorySpy.findByIdRecordType).not.toHaveBeenCalled();
    expect(categoryRepositorySpy.findByNameAndUserId).not.toHaveBeenCalled();
    expect(categoryRepositorySpy.create).not.toHaveBeenCalled();
  });

  test("should throw ValidationError if name is too short", async () => {
    const { sut, categoryRepositorySpy, recordTypeRepositorySpy } = makeSut();
    const input = {
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
    expect(recordTypeRepositorySpy.findByIdRecordType).not.toHaveBeenCalled();
    expect(categoryRepositorySpy.findByNameAndUserId).not.toHaveBeenCalled();
    expect(categoryRepositorySpy.create).not.toHaveBeenCalled();
  });

  test("should throw ValidationError if recordTypeId is missing", async () => {
    const { sut, categoryRepositorySpy, recordTypeRepositorySpy } = makeSut();
    const input = {
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
    expect(recordTypeRepositorySpy.findByIdRecordType).not.toHaveBeenCalled();
    expect(categoryRepositorySpy.findByNameAndUserId).not.toHaveBeenCalled();
    expect(categoryRepositorySpy.create).not.toHaveBeenCalled();
  });

  test("should throw ValidationError if userId is empty", async () => {
    const { sut, categoryRepositorySpy, recordTypeRepositorySpy } = makeSut();
    const input = {
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
    expect(recordTypeRepositorySpy.findByIdRecordType).not.toHaveBeenCalled();
    expect(categoryRepositorySpy.findByNameAndUserId).not.toHaveBeenCalled();
    expect(categoryRepositorySpy.create).not.toHaveBeenCalled();
  });

  test("should throw BusinessRuleError if record type does not exist", async () => {
    const { sut, categoryRepositorySpy, recordTypeRepositorySpy } = makeSut();
    recordTypeRepositorySpy.findByIdRecordType.mockResolvedValue(null);

    const input = {
      name: mockCategory.name,
      description: mockCategory.description,
      type: mockCategory.type,
      recordTypeId: mockCategory.record_type_id,
      userId: mockCategory.user_id,
    };

    await expect(sut.handle(input)).rejects.toThrow(
      new BusinessRuleError(
        `Nenhum tipo de registro encontrado com o ID ${input.recordTypeId} para este usuário`
      )
    );
    expect(recordTypeRepositorySpy.findByIdRecordType).toHaveBeenCalledWith({
      id: input.recordTypeId,
      userId: input.userId,
    });
    expect(recordTypeRepositorySpy.findByIdRecordType).toHaveBeenCalledTimes(1);
    expect(categoryRepositorySpy.findByNameAndUserId).not.toHaveBeenCalled();
    expect(categoryRepositorySpy.create).not.toHaveBeenCalled();
  });

  test("should throw BusinessRuleError if category name already exists for user and record type", async () => {
    const { sut, categoryRepositorySpy, recordTypeRepositorySpy } = makeSut();
    recordTypeRepositorySpy.findByIdRecordType.mockResolvedValue(
      mockRecordType
    );
    categoryRepositorySpy.findByNameAndUserId.mockResolvedValue(mockCategory);

    const input = {
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
    expect(categoryRepositorySpy.create).not.toHaveBeenCalled();
  });

  test("should throw ServerError on unexpected error", async () => {
    const { sut, categoryRepositorySpy, recordTypeRepositorySpy } = makeSut();
    recordTypeRepositorySpy.findByIdRecordType.mockRejectedValue(
      new Error("Database error")
    );

    const input = {
      name: mockCategory.name,
      description: mockCategory.description,
      type: mockCategory.type,
      recordTypeId: mockCategory.record_type_id,
      userId: mockCategory.user_id,
    };

    await expect(sut.handle(input)).rejects.toThrow(
      new ServerError("Falha no cadastro de categoria: Database error")
    );
    expect(recordTypeRepositorySpy.findByIdRecordType).toHaveBeenCalledWith({
      id: input.recordTypeId,
      userId: input.userId,
    });
    expect(recordTypeRepositorySpy.findByIdRecordType).toHaveBeenCalledTimes(1);
    expect(categoryRepositorySpy.findByNameAndUserId).not.toHaveBeenCalled();
    expect(categoryRepositorySpy.create).not.toHaveBeenCalled();
  });
});
