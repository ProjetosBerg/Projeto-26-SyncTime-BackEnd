import { RecordTypesRepositoryProtocol } from "@/infra/db/interfaces/recordTypesRepositoryProtocol";
import { BusinessRuleError } from "@/data/errors/BusinessRuleError";
import { ServerError } from "@/data/errors/ServerError";
import { ValidationError } from "yup";
import { DeleteRecordTypeUseCase } from "@/data/usecases/recordTypes/deleteRecordTypeUseCase";
import { mockRecordType } from "@/tests/unit/mocks/recordTypes/mockRecordTypes";

export const makeRecordTypeRepository =
  (): jest.Mocked<RecordTypesRepositoryProtocol> => ({
    deleteRecordTypes: jest.fn().mockResolvedValue(undefined),
    ...({} as any),
  });

const makeSut = () => {
  const recordTypeRepositorySpy = makeRecordTypeRepository();
  const sut = new DeleteRecordTypeUseCase(recordTypeRepositorySpy);

  return {
    sut,
    recordTypeRepositorySpy,
  };
};

describe("DeleteRecordTypeUseCase", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should delete a record type successfully", async () => {
    const { sut, recordTypeRepositorySpy } = makeSut();
    recordTypeRepositorySpy.deleteRecordTypes.mockResolvedValue(undefined);

    const input = {
      recordTypeId: mockRecordType.id!,
      userId: mockRecordType.user_id,
    };

    await sut.handle(input);

    expect(recordTypeRepositorySpy.deleteRecordTypes).toHaveBeenCalledWith({
      id: input.recordTypeId,
      userId: input.userId,
    });
    expect(recordTypeRepositorySpy.deleteRecordTypes).toHaveBeenCalledTimes(1);
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
    expect(recordTypeRepositorySpy.deleteRecordTypes).not.toHaveBeenCalled();
  });

  test("should throw ValidationError if id is not positive", async () => {
    const { sut, recordTypeRepositorySpy } = makeSut();
    const input = {
      recordTypeId: 0,
      userId: mockRecordType.user_id,
    };

    await expect(sut.handle(input)).rejects.toThrow(ValidationError);
    await expect(sut.handle(input)).rejects.toMatchObject({
      errors: expect.arrayContaining(["ID deve ser positivo"]),
    });
    expect(recordTypeRepositorySpy.deleteRecordTypes).not.toHaveBeenCalled();
  });

  test("should throw ValidationError if userId is empty", async () => {
    const { sut, recordTypeRepositorySpy } = makeSut();
    const input = {
      recordTypeId: mockRecordType.id!,
      userId: "",
    };

    await expect(sut.handle(input)).rejects.toThrow(ValidationError);
    await expect(sut.handle(input)).rejects.toMatchObject({
      errors: expect.arrayContaining(["ID do Usuário é obrigatório"]),
    });
    expect(recordTypeRepositorySpy.deleteRecordTypes).not.toHaveBeenCalled();
  });

  test("should throw BusinessRuleError if record type is not found", async () => {
    const { sut, recordTypeRepositorySpy } = makeSut();
    recordTypeRepositorySpy.deleteRecordTypes.mockRejectedValue(
      new BusinessRuleError(
        `Nenhum tipo de registro encontrado com o ID ${mockRecordType.id} para este usuário`
      )
    );

    const input = {
      recordTypeId: mockRecordType.id!,
      userId: mockRecordType.user_id,
    };

    await expect(sut.handle(input)).rejects.toThrow(
      new BusinessRuleError(
        `Nenhum tipo de registro encontrado com o ID ${input.recordTypeId} para este usuário`
      )
    );
    expect(recordTypeRepositorySpy.deleteRecordTypes).toHaveBeenCalledWith({
      id: input.recordTypeId,
      userId: input.userId,
    });
    expect(recordTypeRepositorySpy.deleteRecordTypes).toHaveBeenCalledTimes(1);
  });

  test("should throw ServerError on unexpected error", async () => {
    const { sut, recordTypeRepositorySpy } = makeSut();
    recordTypeRepositorySpy.deleteRecordTypes.mockRejectedValue(
      new Error("Database error")
    );

    const input = {
      recordTypeId: mockRecordType.id!,
      userId: mockRecordType.user_id,
    };

    await expect(sut.handle(input)).rejects.toThrow(
      new ServerError("Falha ao deletar record type: Database error")
    );
    expect(recordTypeRepositorySpy.deleteRecordTypes).toHaveBeenCalledWith({
      id: input.recordTypeId,
      userId: input.userId,
    });
    expect(recordTypeRepositorySpy.deleteRecordTypes).toHaveBeenCalledTimes(1);
  });
});
