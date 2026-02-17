import { RecordTypesRepositoryProtocol } from "@/infra/db/interfaces/recordTypesRepositoryProtocol";
import { BusinessRuleError } from "@/data/errors/BusinessRuleError";
import { ServerError } from "@/data/errors/ServerError";
import { ValidationError } from "yup";
import { mockRecordType } from "@/tests/unit/mocks/recordTypes/mockRecordTypes";
import { GetByIdRecordTypeUseCase } from "@/data/usecases/recordTypes/getByIdRecordTypesUseCase";

export const makeRecordTypeRepository =
  (): jest.Mocked<RecordTypesRepositoryProtocol> => ({
    create: jest.fn(),
    findByNameAndUserId: jest.fn(),
    findByUserId: jest.fn(),
    findByIdRecordType: jest.fn().mockResolvedValue(mockRecordType),
    ...({} as any),
  });

const makeSut = () => {
  const recordTypeRepositorySpy = makeRecordTypeRepository();
  const sut = new GetByIdRecordTypeUseCase(recordTypeRepositorySpy);

  return {
    sut,
    recordTypeRepositorySpy,
  };
};

describe("GetByIdRecordTypeUseCase", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should return a record type for valid id and user_id", async () => {
    const { sut, recordTypeRepositorySpy } = makeSut();
    recordTypeRepositorySpy.findByIdRecordType.mockResolvedValue(
      mockRecordType
    );

    const input = {
      recordTypeId: mockRecordType.id!,
      userId: mockRecordType.user_id,
    };
    const result = await sut.handle(input);

    expect(result).toEqual(mockRecordType);
    expect(recordTypeRepositorySpy.findByIdRecordType).toHaveBeenCalledWith({
      id: mockRecordType.id,
      userId: mockRecordType.user_id,
    });
    expect(recordTypeRepositorySpy.findByIdRecordType).toHaveBeenCalledTimes(1);
  });

  test("should throw ValidationError if id is missing", async () => {
    const { sut, recordTypeRepositorySpy } = makeSut();
    const input = {
      recordTypeId: undefined as any,
      userId: mockRecordType.user_id,
    };

    await expect(sut.handle(input)).rejects.toThrow(ValidationError);
    await expect(sut.handle(input)).rejects.toMatchObject({
      errors: expect.arrayContaining(["ID do Tipo de Registro é obrigatório"]),
    });
    expect(recordTypeRepositorySpy.findByIdRecordType).not.toHaveBeenCalled();
  });

  test("should throw ValidationError if id is not positive", async () => {
    const { sut, recordTypeRepositorySpy } = makeSut();
    const input = { recordTypeId: 0, userId: mockRecordType.user_id };

    await expect(sut.handle(input)).rejects.toThrow(ValidationError);
    await expect(sut.handle(input)).rejects.toMatchObject({
      errors: expect.arrayContaining(["ID deve ser positivo"]),
    });
    expect(recordTypeRepositorySpy.findByIdRecordType).not.toHaveBeenCalled();
  });

  test("should throw ValidationError if user_id is empty", async () => {
    const { sut, recordTypeRepositorySpy } = makeSut();
    const input = { recordTypeId: mockRecordType.id!, userId: "" };

    await expect(sut.handle(input)).rejects.toThrow(ValidationError);
    await expect(sut.handle(input)).rejects.toMatchObject({
      errors: expect.arrayContaining(["ID do Usuário é obrigatório"]),
    });
    expect(recordTypeRepositorySpy.findByIdRecordType).not.toHaveBeenCalled();
  });

  test("should throw BusinessRuleError if record type is not found", async () => {
    const { sut, recordTypeRepositorySpy } = makeSut();
    recordTypeRepositorySpy.findByIdRecordType.mockResolvedValue(null);

    const input = {
      recordTypeId: mockRecordType.id!,
      userId: mockRecordType.user_id,
    };
    await expect(sut.handle(input)).rejects.toThrow(
      new BusinessRuleError(
        `Nenhum tipo de registro encontrado com o ID ${mockRecordType.id} para este usuário`
      )
    );
    expect(recordTypeRepositorySpy.findByIdRecordType).toHaveBeenCalledWith({
      id: mockRecordType.id,
      userId: mockRecordType.user_id,
    });
    expect(recordTypeRepositorySpy.findByIdRecordType).toHaveBeenCalledTimes(1);
  });

  test("should throw ServerError on unexpected error", async () => {
    const { sut, recordTypeRepositorySpy } = makeSut();
    recordTypeRepositorySpy.findByIdRecordType.mockRejectedValue(
      new Error("Database error")
    );

    const input = {
      recordTypeId: mockRecordType.id!,
      userId: mockRecordType.user_id,
    };
    await expect(sut.handle(input)).rejects.toThrow(
      new ServerError("Falha na busca de record type: Database error")
    );
    expect(recordTypeRepositorySpy.findByIdRecordType).toHaveBeenCalledWith({
      id: mockRecordType.id,
      userId: mockRecordType.user_id,
    });
    expect(recordTypeRepositorySpy.findByIdRecordType).toHaveBeenCalledTimes(1);
  });
});
