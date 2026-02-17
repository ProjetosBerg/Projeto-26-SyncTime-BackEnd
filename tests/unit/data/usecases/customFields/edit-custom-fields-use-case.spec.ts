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
import { EditCustomFieldUseCase } from "@/data/usecases/customFields/editCustomFieldUseCase";

const mockUpdatedCustomField = {
  ...mockCustomField,
  type: FieldType.MULTIPLE,
  label: "Updated Custom Field",
  name: "updated_custom_field",
  category_id: mockCategory.id,
  description: "Updated description",
  options: [
    { value: "Option 1", recordTypeIds: [1, 2] },
    { value: "Option 2", recordTypeIds: [3] },
  ],
  record_type_id: [1, 2, 3],
  required: true,
  updated_at: new Date("2025-07-19T10:00:00.000Z"),
};

export const makeCustomFieldsRepository =
  (): jest.Mocked<CustomFieldsRepositoryProtocol> => ({
    create: jest.fn(),
    findByNameAndUserId: jest.fn().mockResolvedValue(null),
    findByUserId: jest.fn(),
    findByIdAndUserId: jest.fn().mockResolvedValue(mockCustomField),
    update: jest.fn().mockResolvedValue(mockUpdatedCustomField),
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

const makeSut = () => {
  const customFieldsRepositorySpy = makeCustomFieldsRepository();
  const userRepositorySpy = makeUserRepository();
  const categoryRepositorySpy = makeCategoryRepository();
  const sut = new EditCustomFieldUseCase(
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

describe("EditCustomFieldUseCase", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should update a custom field successfully", async () => {
    const {
      sut,
      customFieldsRepositorySpy,
      userRepositorySpy,
      categoryRepositorySpy,
    } = makeSut();
    userRepositorySpy.findOne.mockResolvedValue(mockUser);
    customFieldsRepositorySpy.findByIdAndUserId.mockResolvedValue(
      mockCustomField
    );
    categoryRepositorySpy.findByIdAndUserId.mockResolvedValue(mockCategory);
    customFieldsRepositorySpy.findByNameAndUserId.mockResolvedValue(null);
    customFieldsRepositorySpy.update.mockResolvedValue(mockUpdatedCustomField);

    const input = {
      customFieldsId: mockCustomField.id,
      userId: mockUser.id,
      type: FieldType.MULTIPLE,
      label: mockCustomField.label,
      name: "updated_custom_field",
      categoryId: mockCategory.id,
      description: mockCustomField.description,
      options: [
        { value: "Option 1", recordTypeIds: [1, 2] },
        { value: "Option 2", recordTypeIds: [3] },
      ],
      recordTypeId: mockCustomField.record_type_id,
      required: mockCustomField.required,
    };

    const result = await sut.handle(input);

    expect(result).toEqual(mockUpdatedCustomField);
    expect(userRepositorySpy.findOne).toHaveBeenCalledWith({
      id: input.userId,
    });
    expect(userRepositorySpy.findOne).toHaveBeenCalledTimes(1);
    expect(customFieldsRepositorySpy.findByIdAndUserId).toHaveBeenCalledWith({
      id: input.customFieldsId,
      user_id: input.userId,
    });
    expect(customFieldsRepositorySpy.findByIdAndUserId).toHaveBeenCalledTimes(
      1
    );
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
    expect(customFieldsRepositorySpy.update).toHaveBeenCalledWith({
      id: input.customFieldsId,
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
    expect(customFieldsRepositorySpy.update).toHaveBeenCalledTimes(1);
  });

  test("should update a custom field with minimal fields", async () => {
    const {
      sut,
      customFieldsRepositorySpy,
      userRepositorySpy,
      categoryRepositorySpy,
    } = makeSut();
    userRepositorySpy.findOne.mockResolvedValue(mockUser);
    customFieldsRepositorySpy.findByIdAndUserId.mockResolvedValue(
      mockCustomField
    );
    customFieldsRepositorySpy.findByNameAndUserId.mockResolvedValue(null);
    const minimalUpdatedCustomField = {
      ...mockCustomField,
      label: mockUpdatedCustomField.label,
    };
    customFieldsRepositorySpy.update.mockResolvedValue(
      minimalUpdatedCustomField
    );

    const input = {
      customFieldsId: mockCustomField.id,
      userId: mockUser.id,
      label: mockUpdatedCustomField.label,
    };

    const result = await sut.handle(input);

    expect(result).toEqual(minimalUpdatedCustomField);
    expect(userRepositorySpy.findOne).toHaveBeenCalledWith({
      id: input.userId,
    });
    expect(userRepositorySpy.findOne).toHaveBeenCalledTimes(1);
    expect(customFieldsRepositorySpy.findByIdAndUserId).toHaveBeenCalledWith({
      id: input.customFieldsId,
      user_id: input.userId,
    });
    expect(customFieldsRepositorySpy.findByIdAndUserId).toHaveBeenCalledTimes(
      1
    );
    expect(categoryRepositorySpy.findByIdAndUserId).not.toHaveBeenCalled();
    expect(
      customFieldsRepositorySpy.findByNameAndUserId
    ).not.toHaveBeenCalled();
    expect(customFieldsRepositorySpy.update).toHaveBeenCalledWith({
      id: input.customFieldsId,
      user_id: input.userId,
      label: input.label,
      category_id: undefined,
      record_type_id: undefined,
      type: undefined,
      name: undefined,
      description: undefined,
      options: null,
      required: undefined,
    });
    expect(customFieldsRepositorySpy.update).toHaveBeenCalledTimes(1);
  });

  test("should throw ValidationError if id is empty", async () => {
    const {
      sut,
      customFieldsRepositorySpy,
      userRepositorySpy,
      categoryRepositorySpy,
    } = makeSut();
    const input = {
      customFieldsId: "",
      userId: mockUser.id,
      label: mockUpdatedCustomField.label,
    };

    await expect(sut.handle(input)).rejects.toThrow(ValidationError);
    await expect(sut.handle(input)).rejects.toMatchObject({
      errors: expect.arrayContaining([
        "ID do campo personalizado é obrigatório",
      ]),
    });
    expect(userRepositorySpy.findOne).not.toHaveBeenCalled();
    expect(customFieldsRepositorySpy.findByIdAndUserId).not.toHaveBeenCalled();
    expect(categoryRepositorySpy.findByIdAndUserId).not.toHaveBeenCalled();
    expect(
      customFieldsRepositorySpy.findByNameAndUserId
    ).not.toHaveBeenCalled();
    expect(customFieldsRepositorySpy.update).not.toHaveBeenCalled();
  });

  test("should throw ValidationError if user_id is empty", async () => {
    const {
      sut,
      customFieldsRepositorySpy,
      userRepositorySpy,
      categoryRepositorySpy,
    } = makeSut();
    const input = {
      customFieldsId: mockCustomField.id,
      userId: "",
      label: mockUpdatedCustomField.label,
    };

    await expect(sut.handle(input)).rejects.toThrow(ValidationError);
    await expect(sut.handle(input)).rejects.toMatchObject({
      errors: expect.arrayContaining(["ID do usuário é obrigatório"]),
    });
    expect(userRepositorySpy.findOne).not.toHaveBeenCalled();
    expect(customFieldsRepositorySpy.findByIdAndUserId).not.toHaveBeenCalled();
    expect(categoryRepositorySpy.findByIdAndUserId).not.toHaveBeenCalled();
    expect(
      customFieldsRepositorySpy.findByNameAndUserId
    ).not.toHaveBeenCalled();
    expect(customFieldsRepositorySpy.update).not.toHaveBeenCalled();
  });

  test("should throw ValidationError if type is invalid", async () => {
    const {
      sut,
      customFieldsRepositorySpy,
      userRepositorySpy,
      categoryRepositorySpy,
    } = makeSut();
    const input = {
      customFieldsId: mockCustomField.id,
      userId: mockUser.id,
      type: "invalid-type",
    };

    await expect(sut.handle(input)).rejects.toThrow(ValidationError);
    await expect(sut.handle(input)).rejects.toMatchObject({
      errors: expect.arrayContaining(["Tipo inválido"]),
    });
    expect(userRepositorySpy.findOne).not.toHaveBeenCalled();
    expect(customFieldsRepositorySpy.findByIdAndUserId).not.toHaveBeenCalled();
    expect(categoryRepositorySpy.findByIdAndUserId).not.toHaveBeenCalled();
    expect(
      customFieldsRepositorySpy.findByNameAndUserId
    ).not.toHaveBeenCalled();
    expect(customFieldsRepositorySpy.update).not.toHaveBeenCalled();
  });

  test("should throw ValidationError if options are missing for MULTIPLE type", async () => {
    const {
      sut,
      customFieldsRepositorySpy,
      userRepositorySpy,
      categoryRepositorySpy,
    } = makeSut();
    const input = {
      customFieldsId: mockCustomField.id,
      userId: mockUser.id,
      type: FieldType.MULTIPLE,
    };

    await expect(sut.handle(input)).rejects.toThrow(ValidationError);
    await expect(sut.handle(input)).rejects.toMatchObject({
      errors: expect.arrayContaining([
        "Opções são obrigatórias para o tipo MULTIPLE",
      ]),
    });
    expect(userRepositorySpy.findOne).not.toHaveBeenCalled();
    expect(customFieldsRepositorySpy.findByIdAndUserId).not.toHaveBeenCalled();
    expect(categoryRepositorySpy.findByIdAndUserId).not.toHaveBeenCalled();
    expect(
      customFieldsRepositorySpy.findByNameAndUserId
    ).not.toHaveBeenCalled();
    expect(customFieldsRepositorySpy.update).not.toHaveBeenCalled();
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
      customFieldsId: mockCustomField.id,
      userId: mockUser.id,
      label: mockUpdatedCustomField.label,
    };

    await expect(sut.handle(input)).rejects.toThrow(
      new NotFoundError(`Usuário com ID ${input.userId} não encontrado`)
    );
    expect(userRepositorySpy.findOne).toHaveBeenCalledWith({
      id: input.userId,
    });
    expect(userRepositorySpy.findOne).toHaveBeenCalledTimes(1);
    expect(customFieldsRepositorySpy.findByIdAndUserId).not.toHaveBeenCalled();
    expect(categoryRepositorySpy.findByIdAndUserId).not.toHaveBeenCalled();
    expect(
      customFieldsRepositorySpy.findByNameAndUserId
    ).not.toHaveBeenCalled();
    expect(customFieldsRepositorySpy.update).not.toHaveBeenCalled();
  });

  test("should throw NotFoundError if custom field does not exist", async () => {
    const {
      sut,
      customFieldsRepositorySpy,
      userRepositorySpy,
      categoryRepositorySpy,
    } = makeSut();
    userRepositorySpy.findOne.mockResolvedValue(mockUser);
    customFieldsRepositorySpy.findByIdAndUserId.mockResolvedValue(null);

    const input = {
      customFieldsId: mockCustomField.id,
      userId: mockUser.id,
      label: mockUpdatedCustomField.label,
    };

    await expect(sut.handle(input)).rejects.toThrow(
      new NotFoundError(
        `Campo personalizado com ID ${input.customFieldsId} não encontrado para este usuário`
      )
    );
    expect(userRepositorySpy.findOne).toHaveBeenCalledWith({
      id: input.userId,
    });
    expect(userRepositorySpy.findOne).toHaveBeenCalledTimes(1);
    expect(customFieldsRepositorySpy.findByIdAndUserId).toHaveBeenCalledWith({
      id: input.customFieldsId,
      user_id: input.userId,
    });
    expect(customFieldsRepositorySpy.findByIdAndUserId).toHaveBeenCalledTimes(
      1
    );
    expect(categoryRepositorySpy.findByIdAndUserId).not.toHaveBeenCalled();
    expect(
      customFieldsRepositorySpy.findByNameAndUserId
    ).not.toHaveBeenCalled();
    expect(customFieldsRepositorySpy.update).not.toHaveBeenCalled();
  });

  test("should throw NotFoundError if category does not exist", async () => {
    const {
      sut,
      customFieldsRepositorySpy,
      userRepositorySpy,
      categoryRepositorySpy,
    } = makeSut();
    userRepositorySpy.findOne.mockResolvedValue(mockUser);
    customFieldsRepositorySpy.findByIdAndUserId.mockResolvedValue(
      mockCustomField
    );
    categoryRepositorySpy.findByIdAndUserId.mockResolvedValue(null);

    const input = {
      customFieldsId: mockCustomField.id,
      userId: mockUser.id,
      categoryId: mockCategory.id,
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
    expect(customFieldsRepositorySpy.findByIdAndUserId).toHaveBeenCalledWith({
      id: input.customFieldsId,
      user_id: input.userId,
    });
    expect(customFieldsRepositorySpy.findByIdAndUserId).toHaveBeenCalledTimes(
      1
    );
    expect(categoryRepositorySpy.findByIdAndUserId).toHaveBeenCalledWith({
      id: input.categoryId,
      userId: input.userId,
    });
    expect(categoryRepositorySpy.findByIdAndUserId).toHaveBeenCalledTimes(1);
    expect(
      customFieldsRepositorySpy.findByNameAndUserId
    ).not.toHaveBeenCalled();
    expect(customFieldsRepositorySpy.update).not.toHaveBeenCalled();
  });

  test("should throw BusinessRuleError if new name already exists for another custom field", async () => {
    const {
      sut,
      customFieldsRepositorySpy,
      userRepositorySpy,
      categoryRepositorySpy,
    } = makeSut();
    userRepositorySpy.findOne.mockResolvedValue(mockUser);
    customFieldsRepositorySpy.findByIdAndUserId.mockResolvedValue(
      mockCustomField
    );
    customFieldsRepositorySpy.findByNameAndUserId.mockResolvedValue({
      ...mockCustomField,
      id: "different-custom-field-456",
    });

    const input = {
      customFieldsId: mockCustomField.id,
      userId: mockUser.id,
      name: "existing_custom_field",
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
    expect(customFieldsRepositorySpy.findByIdAndUserId).toHaveBeenCalledWith({
      id: input.customFieldsId,
      user_id: input.userId,
    });
    expect(customFieldsRepositorySpy.findByIdAndUserId).toHaveBeenCalledTimes(
      1
    );
    expect(categoryRepositorySpy.findByIdAndUserId).not.toHaveBeenCalled();
    expect(customFieldsRepositorySpy.findByNameAndUserId).toHaveBeenCalledWith({
      name: input.name,
      user_id: input.userId,
    });
    expect(customFieldsRepositorySpy.findByNameAndUserId).toHaveBeenCalledTimes(
      1
    );
    expect(customFieldsRepositorySpy.update).not.toHaveBeenCalled();
  });

  test("should throw ServerError on unexpected error", async () => {
    const {
      sut,
      customFieldsRepositorySpy,
      userRepositorySpy,
      categoryRepositorySpy,
    } = makeSut();
    userRepositorySpy.findOne.mockResolvedValue(mockUser);
    customFieldsRepositorySpy.findByIdAndUserId.mockResolvedValue(
      mockCustomField
    );
    categoryRepositorySpy.findByIdAndUserId.mockResolvedValue(mockCategory);
    customFieldsRepositorySpy.findByNameAndUserId.mockResolvedValue(null);
    customFieldsRepositorySpy.update.mockRejectedValue(
      new Error("Database error")
    );

    const input = {
      customFieldsId: mockCustomField.id,
      userId: mockUser.id,
      type: FieldType.MULTIPLE,
      label: mockUpdatedCustomField.label,
      name: mockUpdatedCustomField.name,
      categoryId: mockCategory.id,
      description: mockUpdatedCustomField.description,
      options: [
        { value: "Option 1", recordTypeIds: [1, 2] },
        { value: "Option 2", recordTypeIds: [3] },
      ],
      recordTypeId: [1, 2, 3],
      required: true,
    };

    await expect(sut.handle(input)).rejects.toThrow(
      new ServerError(
        "Falha na atualização de campo personalizado: Database error"
      )
    );
    expect(userRepositorySpy.findOne).toHaveBeenCalledWith({
      id: input.userId,
    });
    expect(userRepositorySpy.findOne).toHaveBeenCalledTimes(1);
    expect(customFieldsRepositorySpy.findByIdAndUserId).toHaveBeenCalledWith({
      id: input.customFieldsId,
      user_id: input.userId,
    });
    expect(customFieldsRepositorySpy.findByIdAndUserId).toHaveBeenCalledTimes(
      1
    );
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
    expect(customFieldsRepositorySpy.update).toHaveBeenCalledWith({
      id: input.customFieldsId,
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
    expect(customFieldsRepositorySpy.update).toHaveBeenCalledTimes(1);
  });
});
