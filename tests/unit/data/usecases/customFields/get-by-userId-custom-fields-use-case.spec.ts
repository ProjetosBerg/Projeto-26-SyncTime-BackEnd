import { CustomFieldsRepositoryProtocol } from "@/infra/db/interfaces/customFieldsRepositoryProtocol";
import { UserRepositoryProtocol } from "@/infra/db/interfaces/userRepositoryProtocol";
import { NotFoundError } from "@/data/errors/NotFoundError";
import { ServerError } from "@/data/errors/ServerError";
import { ValidationError } from "yup";
import { mockCustomField } from "@/tests/unit/mocks/customFields/mockCustomFields";
import { GetByUserIdCustomFieldUseCase } from "@/data/usecases/customFields/getByUserIdCustomFieldUseCase";
import { mockCustomFieldMultiple } from "@/tests/unit/mocks/customFields/mockCustomFieldMultiple";
import { mockUser } from "@/tests/unit/mocks/user/mockUser";

export const makeCustomFieldsRepository =
  (): jest.Mocked<CustomFieldsRepositoryProtocol> => ({
    create: jest.fn(),
    findByNameAndUserId: jest.fn(),
    findByUserId: jest
      .fn()
      .mockResolvedValue([mockCustomField, mockCustomFieldMultiple]),
    ...({} as any),
  });

export const makeUserRepository = (): jest.Mocked<UserRepositoryProtocol> => ({
  findOne: jest.fn().mockResolvedValue(mockUser),
  ...({} as any),
});

const makeSut = () => {
  const customFieldsRepositorySpy = makeCustomFieldsRepository();
  const userRepositorySpy = makeUserRepository();
  const sut = new GetByUserIdCustomFieldUseCase(
    customFieldsRepositorySpy,
    userRepositorySpy
  );

  return {
    sut,
    customFieldsRepositorySpy,
    userRepositorySpy,
  };
};

describe("GetByUserIdCustomFieldUseCase", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should retrieve custom fields successfully", async () => {
    const { sut, customFieldsRepositorySpy, userRepositorySpy } = makeSut();
    userRepositorySpy.findOne.mockResolvedValue(mockUser);
    customFieldsRepositorySpy.findByUserId.mockResolvedValue({
      customFields: [mockCustomField, mockCustomFieldMultiple],
      total: 2,
    });

    const input = {
      userId: mockUser.id,
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
    expect(customFieldsRepositorySpy.findByUserId).toHaveBeenCalledWith({
      user_id: input.userId,
      page: 1,
      limit: 10,
      search: undefined,
      sortBy: "label",
      order: "ASC",
    });
    expect(customFieldsRepositorySpy.findByUserId).toHaveBeenCalledTimes(1);
  });

  test("should return empty array if no custom fields exist", async () => {
    const { sut, customFieldsRepositorySpy, userRepositorySpy } = makeSut();
    userRepositorySpy.findOne.mockResolvedValue(mockUser);
    customFieldsRepositorySpy.findByUserId.mockResolvedValue({
      customFields: [],
      total: 0,
    });

    const input = {
      userId: mockUser.id,
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
    expect(customFieldsRepositorySpy.findByUserId).toHaveBeenCalledWith({
      user_id: input.userId,
      page: 1,
      limit: 10,
      search: undefined,
      sortBy: "label",
      order: "ASC",
    });
    expect(customFieldsRepositorySpy.findByUserId).toHaveBeenCalledTimes(1);
  });

  test("should throw ValidationError if user_id is empty", async () => {
    const { sut, customFieldsRepositorySpy, userRepositorySpy } = makeSut();
    const input = {
      userId: "",
    };

    await expect(sut.handle(input)).rejects.toThrow(ValidationError);
    await expect(sut.handle(input)).rejects.toMatchObject({
      errors: expect.arrayContaining(["ID do usuário é obrigatório"]),
    });
    expect(userRepositorySpy.findOne).not.toHaveBeenCalled();
    expect(customFieldsRepositorySpy.findByUserId).not.toHaveBeenCalled();
  });

  test("should throw NotFoundError if user does not exist", async () => {
    const { sut, customFieldsRepositorySpy, userRepositorySpy } = makeSut();
    userRepositorySpy.findOne.mockResolvedValue(null);

    const input = {
      userId: mockUser.id,
    };

    await expect(sut.handle(input)).rejects.toThrow(
      new NotFoundError(`Usuário com ID ${input.userId} não encontrado`)
    );
    expect(userRepositorySpy.findOne).toHaveBeenCalledWith({
      id: input.userId,
    });
    expect(userRepositorySpy.findOne).toHaveBeenCalledTimes(1);
    expect(customFieldsRepositorySpy.findByUserId).not.toHaveBeenCalled();
  });

  test("should throw ServerError on unexpected error", async () => {
    const { sut, customFieldsRepositorySpy, userRepositorySpy } = makeSut();
    userRepositorySpy.findOne.mockResolvedValue(mockUser);
    customFieldsRepositorySpy.findByUserId.mockRejectedValue(
      new Error("Database error")
    );

    const input = {
      userId: mockUser.id,
    };

    await expect(sut.handle(input)).rejects.toThrow(
      new ServerError("Falha na busca de campos personalizados: Database error")
    );
    expect(userRepositorySpy.findOne).toHaveBeenCalledWith({
      id: input.userId,
    });
    expect(userRepositorySpy.findOne).toHaveBeenCalledTimes(1);
    expect(customFieldsRepositorySpy.findByUserId).toHaveBeenCalledWith({
      user_id: input.userId,
      page: 1,
      limit: 10,
      search: undefined,
      sortBy: "label",
      order: "ASC",
    });
    expect(customFieldsRepositorySpy.findByUserId).toHaveBeenCalledTimes(1);
  });
});
