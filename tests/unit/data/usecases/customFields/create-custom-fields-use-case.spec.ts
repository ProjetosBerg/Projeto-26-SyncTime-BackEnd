import { CustomFieldsRepositoryProtocol } from "@/infra/db/interfaces/customFieldsRepositoryProtocol";
import { UserRepositoryProtocol } from "@/infra/db/interfaces/userRepositoryProtocol";
import { CategoryRepositoryProtocol } from "@/infra/db/interfaces/categoryRepositoryProtocol";
import { NotFoundError } from "@/data/errors/NotFoundError";
import { BusinessRuleError } from "@/data/errors/BusinessRuleError";
import { ServerError } from "@/data/errors/ServerError";
import { ValidationError } from "yup";
import { mockCategory } from "@/tests/unit/mocks/category/mockCategory";
import { FieldType } from "@/domain/entities/mongo/CustomFieldsSchema";
import { mockCustomField } from "@/tests/unit/mocks/customFields/mockCustomFields";
import { mockUser } from "@/tests/unit/mocks/user/mockUser";
import { CreateCustomFieldUseCase } from "@/data/usecases/customFields/createCustomFieldUseCase";

export const makeCustomFieldsRepository =
  (): jest.Mocked<CustomFieldsRepositoryProtocol> => ({
    create: jest.fn().mockResolvedValue(mockCustomField),
    findByNameAndUserId: jest.fn().mockResolvedValue(null),
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
    deleteCategory: jest.fn(),
    updateCategory: jest.fn(),
    ...({} as any),
  });

const makeSut = () => {
  const customFieldsRepositorySpy = makeCustomFieldsRepository();
  const userRepositorySpy = makeUserRepository();
  const categoryRepositorySpy = makeCategoryRepository();
  const sut = new CreateCustomFieldUseCase(
    customFieldsRepositorySpy,
    userRepositorySpy,
    categoryRepositorySpy
  );

  return {
    sut,
    customFieldsRepositorySpy,
    userRepositorySpy,
    categoryRepositorySpy,
  };
};

describe("CreateCustomFieldUseCase", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should create a custom field successfully", async () => {
    const {
      sut,
      customFieldsRepositorySpy,
      userRepositorySpy,
      categoryRepositorySpy,
    } = makeSut();
    userRepositorySpy.findOne.mockResolvedValue(mockUser);
    categoryRepositorySpy.findByIdAndUserId.mockResolvedValue(mockCategory);
    customFieldsRepositorySpy.findByNameAndUserId.mockResolvedValue(null);
    customFieldsRepositorySpy.create.mockResolvedValue(mockCustomField);

    const input = {
      type: FieldType.TEXT,
      label: mockCustomField.label,
      name: mockCustomField.name,
      categoryId: mockCategory.id,
      userId: mockUser.id,
      description: mockCustomField.description,
      recordTypeId: mockCustomField.record_type_id,
      required: false,
    };

    const result = await sut.handle(input);

    expect(result).toEqual(mockCustomField);
    expect(userRepositorySpy.findOne).toHaveBeenCalledWith({
      id: input.userId,
    });
    expect(userRepositorySpy.findOne).toHaveBeenCalledTimes(1);
    expect(categoryRepositorySpy.findByIdAndUserId).toHaveBeenCalledWith({
      id: input.categoryId,
      userId: input.userId,
    });
    expect(categoryRepositorySpy.findByIdAndUserId).toHaveBeenCalledTimes(1);
    expect(customFieldsRepositorySpy.findByNameAndUserId).toHaveBeenCalledWith({
      name: input.name,
      user_id: input.userId,
    });
    expect(customFieldsRepositorySpy.findByNameAndUserId).toHaveBeenCalledTimes(
      1
    );
    expect(customFieldsRepositorySpy.create).toHaveBeenCalledWith({
      category_id: input.categoryId,
      record_type_id: input.recordTypeId,
      user_id: input.userId,
      type: input.type,
      label: input.label,
      name: input.name,
      description: input.description,
      options: undefined,
      required: input.required,
    });
    expect(customFieldsRepositorySpy.create).toHaveBeenCalledTimes(1);
  });

  test("should create a custom field with MULTIPLE type and options", async () => {
    const {
      sut,
      customFieldsRepositorySpy,
      userRepositorySpy,
      categoryRepositorySpy,
    } = makeSut();
    userRepositorySpy.findOne.mockResolvedValue(mockUser);
    categoryRepositorySpy.findByIdAndUserId.mockResolvedValue(mockCategory);
    customFieldsRepositorySpy.findByNameAndUserId.mockResolvedValue(null);
    const mockCustomFieldWithOptions = {
      ...mockCustomField,
      type: FieldType.MULTIPLE,
      options: [
        { value: "Option 1", recordTypeIds: [1, 2] },
        { value: "Option 2", recordTypeIds: [3] },
      ],
    };
    customFieldsRepositorySpy.create.mockResolvedValue(
      mockCustomFieldWithOptions
    );

    const input = {
      type: FieldType.TEXT,
      label: mockCustomField.label,
      name: mockCustomField.name,
      categoryId: mockCategory.id,
      userId: mockUser.id,
      description: mockCustomField.description,
      recordTypeId: mockCustomField.record_type_id,
      required: false,
      options: [
        { value: "Option 1", recordTypeIds: [1, 2] },
        { value: "Option 2", recordTypeIds: [3] },
      ],
      record_type_id: [1, 2, 3],
    };

    const result = await sut.handle(input);

    expect(result).toEqual(mockCustomFieldWithOptions);
    expect(userRepositorySpy.findOne).toHaveBeenCalledWith({
      id: input.userId,
    });
    expect(userRepositorySpy.findOne).toHaveBeenCalledTimes(1);
    expect(categoryRepositorySpy.findByIdAndUserId).toHaveBeenCalledWith({
      id: input.categoryId,
      userId: input.userId,
    });
    expect(categoryRepositorySpy.findByIdAndUserId).toHaveBeenCalledTimes(1);
    expect(customFieldsRepositorySpy.findByNameAndUserId).toHaveBeenCalledWith({
      name: input.name,
      user_id: input.userId,
    });
    expect(customFieldsRepositorySpy.findByNameAndUserId).toHaveBeenCalledTimes(
      1
    );
    expect(customFieldsRepositorySpy.create).toHaveBeenCalledWith({
      category_id: input.categoryId,
      record_type_id: input.recordTypeId,
      user_id: input.userId,
      type: input.type,
      label: input.label,
      name: input.name,
      description: input.description,
      options: input.options,
      required: input.required,
    });
    expect(customFieldsRepositorySpy.create).toHaveBeenCalledTimes(1);
  });

  test("should throw ValidationError if type is invalid", async () => {
    const {
      sut,
      customFieldsRepositorySpy,
      userRepositorySpy,
      categoryRepositorySpy,
    } = makeSut();
    const input = {
      type: "invalid",
      label: mockCustomField.label,
      name: mockCustomField.name,
      categoryId: mockCategory.id,
      userId: mockUser.id,
      description: mockCustomField.description,
      recordTypeId: mockCustomField.record_type_id,
      required: false,
    };

    await expect(sut.handle(input)).rejects.toThrow(ValidationError);
    await expect(sut.handle(input)).rejects.toMatchObject({
      errors: expect.arrayContaining(["Tipo inválido"]),
    });
    expect(userRepositorySpy.findOne).not.toHaveBeenCalled();
    expect(categoryRepositorySpy.findByIdAndUserId).not.toHaveBeenCalled();
    expect(
      customFieldsRepositorySpy.findByNameAndUserId
    ).not.toHaveBeenCalled();
    expect(customFieldsRepositorySpy.create).not.toHaveBeenCalled();
  });

  test("should throw ValidationError if options are missing for MULTIPLE type", async () => {
    const {
      sut,
      customFieldsRepositorySpy,
      userRepositorySpy,
      categoryRepositorySpy,
    } = makeSut();
    const input = {
      type: FieldType.MULTIPLE,
      label: mockCustomField.label,
      name: mockCustomField.name,
      categoryId: mockCategory.id,
      userId: mockUser.id,
      description: mockCustomField.description,
      recordTypeId: mockCustomField.record_type_id,
      required: false,
    };

    await expect(sut.handle(input)).rejects.toThrow(ValidationError);
    await expect(sut.handle(input)).rejects.toMatchObject({
      errors: expect.arrayContaining([
        "Opções são obrigatórias para o tipo MULTIPLE",
      ]),
    });
    expect(userRepositorySpy.findOne).not.toHaveBeenCalled();
    expect(categoryRepositorySpy.findByIdAndUserId).not.toHaveBeenCalled();
    expect(
      customFieldsRepositorySpy.findByNameAndUserId
    ).not.toHaveBeenCalled();
    expect(customFieldsRepositorySpy.create).not.toHaveBeenCalled();
  });

  test("should throw NotFoundError if user does not exist", async () => {
    const {
      sut,
      customFieldsRepositorySpy,
      userRepositorySpy,
      categoryRepositorySpy,
    } = makeSut();
    userRepositorySpy.findOne.mockResolvedValue(null);

    const input = {
      type: FieldType.TEXT,
      label: mockCustomField.label,
      name: mockCustomField.name,
      categoryId: mockCategory.id,
      userId: mockUser.id,
      description: mockCustomField.description,
      recordTypeId: mockCustomField.record_type_id,
      required: false,
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
      customFieldsRepositorySpy.findByNameAndUserId
    ).not.toHaveBeenCalled();
    expect(customFieldsRepositorySpy.create).not.toHaveBeenCalled();
  });

  test("should throw NotFoundError if category does not exist", async () => {
    const {
      sut,
      customFieldsRepositorySpy,
      userRepositorySpy,
      categoryRepositorySpy,
    } = makeSut();
    userRepositorySpy.findOne.mockResolvedValue(mockUser);
    categoryRepositorySpy.findByIdAndUserId.mockResolvedValue(null);

    const input = {
      type: FieldType.TEXT,
      label: mockCustomField.label,
      name: mockCustomField.name,
      categoryId: mockCategory.id,
      userId: mockUser.id,
      description: mockCustomField.description,
      recordTypeId: mockCustomField.record_type_id,
      required: false,
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
      customFieldsRepositorySpy.findByNameAndUserId
    ).not.toHaveBeenCalled();
    expect(customFieldsRepositorySpy.create).not.toHaveBeenCalled();
  });

  test("should throw BusinessRuleError if custom field name already exists", async () => {
    const {
      sut,
      customFieldsRepositorySpy,
      userRepositorySpy,
      categoryRepositorySpy,
    } = makeSut();
    userRepositorySpy.findOne.mockResolvedValue(mockUser);
    categoryRepositorySpy.findByIdAndUserId.mockResolvedValue(mockCategory);
    customFieldsRepositorySpy.findByNameAndUserId.mockResolvedValue(
      mockCustomField
    );

    const input = {
      type: FieldType.TEXT,
      label: mockCustomField.label,
      name: mockCustomField.name,
      categoryId: mockCategory.id,
      userId: mockUser.id,
      description: mockCustomField.description,
      recordTypeId: mockCustomField.record_type_id,
      required: false,
    };

    await expect(sut.handle(input)).rejects.toThrow(
      new BusinessRuleError(
        `Já existe um campo personalizado com o nome ${input.name} para este usuário`
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
    expect(customFieldsRepositorySpy.findByNameAndUserId).toHaveBeenCalledWith({
      name: input.name,
      user_id: input.userId,
    });
    expect(customFieldsRepositorySpy.findByNameAndUserId).toHaveBeenCalledTimes(
      1
    );
    expect(customFieldsRepositorySpy.create).not.toHaveBeenCalled();
  });

  test("should throw ServerError on unexpected error", async () => {
    const {
      sut,
      customFieldsRepositorySpy,
      userRepositorySpy,
      categoryRepositorySpy,
    } = makeSut();
    userRepositorySpy.findOne.mockResolvedValue(mockUser);
    categoryRepositorySpy.findByIdAndUserId.mockResolvedValue(mockCategory);
    customFieldsRepositorySpy.findByNameAndUserId.mockResolvedValue(null);
    customFieldsRepositorySpy.create.mockRejectedValue(
      new Error("Database error")
    );

    const input = {
      type: FieldType.TEXT,
      label: mockCustomField.label,
      name: mockCustomField.name,
      categoryId: mockCategory.id,
      userId: mockUser.id,
      description: mockCustomField.description,
      recordTypeId: mockCustomField.record_type_id,
      required: false,
    };

    await expect(sut.handle(input)).rejects.toThrow(
      new ServerError(
        "Falha no cadastro do campo personalizado: Database error"
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
    expect(customFieldsRepositorySpy.findByNameAndUserId).toHaveBeenCalledWith({
      name: input.name,
      user_id: input.userId,
    });
    expect(customFieldsRepositorySpy.findByNameAndUserId).toHaveBeenCalledTimes(
      1
    );
    expect(customFieldsRepositorySpy.create).toHaveBeenCalledWith({
      category_id: input.categoryId,
      record_type_id: input.recordTypeId,
      user_id: input.userId,
      type: input.type,
      label: input.label,
      name: input.name,
      description: input.description,
      options: undefined,
      required: input.required,
    });
    expect(customFieldsRepositorySpy.create).toHaveBeenCalledTimes(1);
  });
});
