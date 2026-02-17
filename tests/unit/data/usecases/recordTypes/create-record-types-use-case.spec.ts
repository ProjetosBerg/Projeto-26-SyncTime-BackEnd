import { RecordTypesRepositoryProtocol } from "@/infra/db/interfaces/recordTypesRepositoryProtocol";
import { BusinessRuleError } from "@/data/errors/BusinessRuleError";
import { ServerError } from "@/data/errors/ServerError";
import { ValidationError } from "yup";
import { mockRecordType } from "@/tests/unit/mocks/recordTypes/mockRecordTypes";
import { CreateRecordTypeUseCase } from "@/data/usecases/recordTypes/createRecordTypesUseCase";

export const makeRecordTypeRepository =
  (): jest.Mocked<RecordTypesRepositoryProtocol> => ({
    create: jest.fn().mockResolvedValue(mockRecordType),
    findByNameAndUserId: jest.fn().mockResolvedValue(null),
    ...({} as any),
  });

const makeSut = () => {
  const recordTypeRepositorySpy = makeRecordTypeRepository();
  const sut = new CreateRecordTypeUseCase(recordTypeRepositorySpy);

  return {
    sut,
    recordTypeRepositorySpy,
  };
};

describe("CreateRecordTypeUseCase", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should create a record type successfully", async () => {
    const { sut, recordTypeRepositorySpy } = makeSut();
    recordTypeRepositorySpy.findByNameAndUserId.mockResolvedValue(null);
    recordTypeRepositorySpy.create.mockResolvedValue(mockRecordType);

    const input = {
      userId: mockRecordType.user_id,
      name: mockRecordType.name,
      icone: mockRecordType.icone,
    };

    const result = await sut.handle(input);

    expect(result).toEqual(mockRecordType);
    expect(recordTypeRepositorySpy.findByNameAndUserId).toHaveBeenCalledWith({
      name: mockRecordType.name,
      userId: mockRecordType.user_id,
    });
    expect(recordTypeRepositorySpy.findByNameAndUserId).toHaveBeenCalledTimes(
      1
    );
    expect(recordTypeRepositorySpy.create).toHaveBeenCalledWith({
      userId: mockRecordType.user_id,
      name: mockRecordType.name,
      icone: mockRecordType.icone,
    });
    expect(recordTypeRepositorySpy.create).toHaveBeenCalledTimes(1);
  });

  test("should throw ValidationError if user_id is empty", async () => {
    const { sut, recordTypeRepositorySpy } = makeSut();
    const input = {
      userId: "",
      name: mockRecordType.name,
      icone: mockRecordType.icone,
    };

    await expect(sut.handle(input)).rejects.toThrow(ValidationError);
    await expect(sut.handle(input)).rejects.toMatchObject({
      errors: expect.arrayContaining(["ID do Usuário é obrigatório"]),
    });
    expect(recordTypeRepositorySpy.findByNameAndUserId).not.toHaveBeenCalled();
    expect(recordTypeRepositorySpy.create).not.toHaveBeenCalled();
  });

  test("should throw ValidationError if name is empty", async () => {
    const { sut, recordTypeRepositorySpy } = makeSut();
    const input = {
      userId: mockRecordType.user_id,
      name: "",
      icone: mockRecordType.icone,
    };

    await expect(sut.handle(input)).rejects.toThrow(ValidationError);
    await expect(sut.handle(input)).rejects.toMatchObject({
      errors: expect.arrayContaining(["Nome é obrigatório"]),
    });
    expect(recordTypeRepositorySpy.findByNameAndUserId).not.toHaveBeenCalled();
    expect(recordTypeRepositorySpy.create).not.toHaveBeenCalled();
  });

  test("should throw ValidationError if icone is empty", async () => {
    const { sut, recordTypeRepositorySpy } = makeSut();
    const input = {
      userId: mockRecordType.user_id,
      name: mockRecordType.name,
      icone: "",
    };

    await expect(sut.handle(input)).rejects.toThrow(ValidationError);
    await expect(sut.handle(input)).rejects.toMatchObject({
      errors: expect.arrayContaining(["Ícone é obrigatório"]),
    });
    expect(recordTypeRepositorySpy.findByNameAndUserId).not.toHaveBeenCalled();
    expect(recordTypeRepositorySpy.create).not.toHaveBeenCalled();
  });

  test("should throw BusinessRuleError if record type name already exists for user", async () => {
    const { sut, recordTypeRepositorySpy } = makeSut();
    recordTypeRepositorySpy.findByNameAndUserId.mockResolvedValue(
      mockRecordType
    );

    const input = {
      userId: mockRecordType.user_id,
      name: mockRecordType.name,
      icone: mockRecordType.icone,
    };

    await expect(sut.handle(input)).rejects.toThrow(
      new BusinessRuleError(
        `Já existe um tipo de registro com o nome "${mockRecordType.name}" para este usuário`
      )
    );
    expect(recordTypeRepositorySpy.findByNameAndUserId).toHaveBeenCalledWith({
      name: mockRecordType.name,
      userId: mockRecordType.user_id,
    });
    expect(recordTypeRepositorySpy.findByNameAndUserId).toHaveBeenCalledTimes(
      1
    );
    expect(recordTypeRepositorySpy.create).not.toHaveBeenCalled();
  });

  test("should throw ServerError on unexpected error", async () => {
    const { sut, recordTypeRepositorySpy } = makeSut();
    recordTypeRepositorySpy.findByNameAndUserId.mockRejectedValue(
      new Error("Database error")
    );

    const input = {
      userId: mockRecordType.user_id,
      name: mockRecordType.name,
      icone: mockRecordType.icone,
    };

    await expect(sut.handle(input)).rejects.toThrow(
      new ServerError("Falha no cadastro do record type: Database error")
    );
    expect(recordTypeRepositorySpy.findByNameAndUserId).toHaveBeenCalledWith({
      name: mockRecordType.name,
      userId: mockRecordType.user_id,
    });
    expect(recordTypeRepositorySpy.findByNameAndUserId).toHaveBeenCalledTimes(
      1
    );
    expect(recordTypeRepositorySpy.create).not.toHaveBeenCalled();
  });
});
