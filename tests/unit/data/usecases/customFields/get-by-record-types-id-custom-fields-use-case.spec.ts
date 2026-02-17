import { CustomFieldsRepositoryProtocol } from "@/infra/db/interfaces/customFieldsRepositoryProtocol";
import { UserRepositoryProtocol } from "@/infra/db/interfaces/userRepositoryProtocol";
import { NotFoundError } from "@/data/errors/NotFoundError";
import { ServerError } from "@/data/errors/ServerError";
import { number, ValidationError } from "yup";
import { mockCustomField } from "@/tests/unit/mocks/customFields/mockCustomFields";
import { mockCustomFieldMultiple } from "@/tests/unit/mocks/customFields/mockCustomFieldMultiple";
import { mockUser } from "@/tests/unit/mocks/user/mockUser";
import { GetByRecordTypeIdCustomFieldUseCase } from "@/data/usecases/customFields/getByRecordTypeIdCustomFieldUseCase";

export const makeCustomFieldsRepository =
  (): jest.Mocked<CustomFieldsRepositoryProtocol> => ({
    create: jest.fn(),
    findByNameAndUserId: jest.fn(),
    findByRecordTypeId: jest.fn().mockResolvedValue({
      customFields: [mockCustomField, mockCustomFieldMultiple],
      total: 2,
    }),
    ...({} as any),
  });

export const makeUserRepository = (): jest.Mocked<UserRepositoryProtocol> => ({
  findOne: jest.fn().mockResolvedValue(mockUser),
  ...({} as any),
});

const makeSut = () => {
  const customFieldsRepositorySpy = makeCustomFieldsRepository();
  const userRepositorySpy = makeUserRepository();
  const sut = new GetByRecordTypeIdCustomFieldUseCase(
    customFieldsRepositorySpy,
    userRepositorySpy
  );

  return {
    sut,
    customFieldsRepositorySpy,
    userRepositorySpy,
  };
};

describe("GetByRecordTypeIdCustomFieldUseCase", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should retrieve custom fields successfully", async () => {
    const { sut, customFieldsRepositorySpy, userRepositorySpy } = makeSut();
    userRepositorySpy.findOne.mockResolvedValue(mockUser);
    customFieldsRepositorySpy.findByRecordTypeId.mockResolvedValue({
      customFields: [mockCustomField, mockCustomFieldMultiple],
      total: 2,
    });

    const input = {
      userId: mockUser.id,
      recordTypeId: 1,
      categoryId: "category-1",
    };

    const result = await sut.handle(input);

    expect(result).toEqual({
      customFields: [mockCustomField, mockCustomFieldMultiple],
      total: 2,
    });
    expect(userRepositorySpy.findOne).toHaveBeenCalledWith({
      id: input.userId,
    });
    expect(userRepositorySpy.findOne).toHaveBeenCalledTimes(1);
    expect(customFieldsRepositorySpy.findByRecordTypeId).toHaveBeenCalledWith({
      user_id: input.userId,
      record_type_id: input.recordTypeId,
      category_id: input.categoryId,
    });
    expect(customFieldsRepositorySpy.findByRecordTypeId).toHaveBeenCalledTimes(
      1
    );
  });

  test("should return empty array if no custom fields exist", async () => {
    const { sut, customFieldsRepositorySpy, userRepositorySpy } = makeSut();
    userRepositorySpy.findOne.mockResolvedValue(mockUser);
    customFieldsRepositorySpy.findByRecordTypeId.mockResolvedValue({
      customFields: [],
      total: 0,
    });

    const input = {
      userId: mockUser.id,
      recordTypeId: 1,
      categoryId: "category-1",
    };

    const result = await sut.handle(input);

    expect(result).toEqual({
      customFields: [],
      total: 0,
    });
    expect(userRepositorySpy.findOne).toHaveBeenCalledWith({
      id: input.userId,
    });
    expect(userRepositorySpy.findOne).toHaveBeenCalledTimes(1);
    expect(customFieldsRepositorySpy.findByRecordTypeId).toHaveBeenCalledWith({
      user_id: input.userId,
      record_type_id: input.recordTypeId,
      category_id: input.categoryId,
    });
    expect(customFieldsRepositorySpy.findByRecordTypeId).toHaveBeenCalledTimes(
      1
    );
  });

  test("should throw ValidationError if user_id is empty", async () => {
    const { sut, customFieldsRepositorySpy, userRepositorySpy } = makeSut();
    const input = {
      userId: "",
      recordTypeId: 1,
      categoryId: "category-1",
    };

    await expect(sut.handle(input)).rejects.toThrow(ValidationError);
    await expect(sut.handle(input)).rejects.toMatchObject({
      errors: expect.arrayContaining(["ID do usuário é obrigatório"]),
    });
    expect(userRepositorySpy.findOne).not.toHaveBeenCalled();
    expect(customFieldsRepositorySpy.findByRecordTypeId).not.toHaveBeenCalled();
  });

  test("should throw NotFoundError if user does not exist", async () => {
    const { sut, customFieldsRepositorySpy, userRepositorySpy } = makeSut();
    userRepositorySpy.findOne.mockResolvedValue(null);

    const input = {
      userId: mockUser.id,
      recordTypeId: 1,
      categoryId: "category-1",
    };

    await expect(sut.handle(input)).rejects.toThrow(
      new NotFoundError(`Usuário com ID ${input.userId} não encontrado`)
    );
    expect(userRepositorySpy.findOne).toHaveBeenCalledWith({
      id: input.userId,
    });
    expect(userRepositorySpy.findOne).toHaveBeenCalledTimes(1);
    expect(customFieldsRepositorySpy.findByRecordTypeId).not.toHaveBeenCalled();
  });

  test("should throw ServerError on unexpected error", async () => {
    const { sut, customFieldsRepositorySpy, userRepositorySpy } = makeSut();
    userRepositorySpy.findOne.mockResolvedValue(mockUser);
    customFieldsRepositorySpy.findByRecordTypeId.mockRejectedValue(
      new Error("Database error")
    );

    const input = {
      userId: mockUser.id,
      recordTypeId: 1,
      categoryId: "category-1",
    };

    await expect(sut.handle(input)).rejects.toThrow(
      new ServerError("Falha na busca de campos personalizados: Database error")
    );
    expect(userRepositorySpy.findOne).toHaveBeenCalledWith({
      id: input.userId,
    });
    expect(userRepositorySpy.findOne).toHaveBeenCalledTimes(1);
    expect(customFieldsRepositorySpy.findByRecordTypeId).toHaveBeenCalledWith({
      user_id: input.userId,
      record_type_id: input.recordTypeId,
      category_id: input.categoryId,
    });
    expect(customFieldsRepositorySpy.findByRecordTypeId).toHaveBeenCalledTimes(
      1
    );
  });
});
