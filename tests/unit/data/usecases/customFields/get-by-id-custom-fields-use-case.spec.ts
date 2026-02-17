import { CustomFieldsRepositoryProtocol } from "@/infra/db/interfaces/customFieldsRepositoryProtocol";
import { UserRepositoryProtocol } from "@/infra/db/interfaces/userRepositoryProtocol";
import { NotFoundError } from "@/data/errors/NotFoundError";
import { ServerError } from "@/data/errors/ServerError";
import { ValidationError } from "yup";
import { mockCustomField } from "@/tests/unit/mocks/customFields/mockCustomFields";
import { GetByIdCustomFieldUseCase } from "@/data/usecases/customFields/getByIdCustomFieldUseCase";
import { mockUser } from "@/tests/unit/mocks/user/mockUser";

export const makeCustomFieldsRepository =
  (): jest.Mocked<CustomFieldsRepositoryProtocol> => ({
    create: jest.fn(),
    findByNameAndUserId: jest.fn(),
    findByUserId: jest.fn(),
    findByIdAndUserId: jest.fn().mockResolvedValue(mockCustomField),
    update: jest.fn(),
    ...({} as any),
  });

export const makeUserRepository = (): jest.Mocked<UserRepositoryProtocol> => ({
  findOne: jest.fn().mockResolvedValue(mockUser),
  ...({} as any),
});

const makeSut = () => {
  const customFieldsRepositorySpy = makeCustomFieldsRepository();
  const userRepositorySpy = makeUserRepository();
  const sut = new GetByIdCustomFieldUseCase(
    customFieldsRepositorySpy,
    userRepositorySpy
  );

  return {
    sut,
    customFieldsRepositorySpy,
    userRepositorySpy,
  };
};

describe("GetByIdCustomFieldUseCase", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should retrieve a custom field successfully", async () => {
    const { sut, customFieldsRepositorySpy, userRepositorySpy } = makeSut();
    userRepositorySpy.findOne.mockResolvedValue(mockUser);
    customFieldsRepositorySpy.findByIdAndUserId.mockResolvedValue(
      mockCustomField
    );

    const input = {
      customFieldsId: mockCustomField.id,
      userId: mockUser.id,
    };

    const result = await sut.handle(input);

    expect(result).toEqual(mockCustomField);
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
  });

  test("should throw ValidationError if id is empty", async () => {
    const { sut, customFieldsRepositorySpy, userRepositorySpy } = makeSut();
    const input = {
      customFieldsId: "",
      userId: mockUser.id,
    };

    await expect(sut.handle(input)).rejects.toThrow(ValidationError);
    await expect(sut.handle(input)).rejects.toMatchObject({
      errors: expect.arrayContaining([
        "ID do campo personalizado é obrigatório",
      ]),
    });
    expect(userRepositorySpy.findOne).not.toHaveBeenCalled();
    expect(customFieldsRepositorySpy.findByIdAndUserId).not.toHaveBeenCalled();
  });

  test("should throw ValidationError if user_id is empty", async () => {
    const { sut, customFieldsRepositorySpy, userRepositorySpy } = makeSut();
    const input = {
      customFieldsId: mockCustomField.id,
      userId: "",
    };

    await expect(sut.handle(input)).rejects.toThrow(ValidationError);
    await expect(sut.handle(input)).rejects.toMatchObject({
      errors: expect.arrayContaining(["ID do usuário é obrigatório"]),
    });
    expect(userRepositorySpy.findOne).not.toHaveBeenCalled();
    expect(customFieldsRepositorySpy.findByIdAndUserId).not.toHaveBeenCalled();
  });

  test("should throw NotFoundError if user does not exist", async () => {
    const { sut, customFieldsRepositorySpy, userRepositorySpy } = makeSut();
    userRepositorySpy.findOne.mockResolvedValue(null);

    const input = {
      customFieldsId: mockCustomField.id,
      userId: mockUser.id,
    };

    await expect(sut.handle(input)).rejects.toThrow(
      new NotFoundError(`Usuário com ID ${input.userId} não encontrado`)
    );
    expect(userRepositorySpy.findOne).toHaveBeenCalledWith({
      id: input.userId,
    });
    expect(userRepositorySpy.findOne).toHaveBeenCalledTimes(1);
    expect(customFieldsRepositorySpy.findByIdAndUserId).not.toHaveBeenCalled();
  });

  test("should throw NotFoundError if custom field does not exist", async () => {
    const { sut, customFieldsRepositorySpy, userRepositorySpy } = makeSut();
    userRepositorySpy.findOne.mockResolvedValue(mockUser);
    customFieldsRepositorySpy.findByIdAndUserId.mockResolvedValue(null);

    const input = {
      customFieldsId: mockCustomField.id,
      userId: mockUser.id,
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
  });

  test("should throw ServerError on unexpected error", async () => {
    const { sut, customFieldsRepositorySpy, userRepositorySpy } = makeSut();
    userRepositorySpy.findOne.mockResolvedValue(mockUser);
    customFieldsRepositorySpy.findByIdAndUserId.mockRejectedValue(
      new Error("Database error")
    );

    const input = {
      customFieldsId: mockCustomField.id,
      userId: mockUser.id,
    };

    await expect(sut.handle(input)).rejects.toThrow(
      new ServerError("Falha na busca de campo personalizado: Database error")
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
  });
});
