import { RecordTypesRepositoryProtocol } from "@/infra/db/interfaces/recordTypesRepositoryProtocol";
import { BusinessRuleError } from "@/data/errors/BusinessRuleError";
import { ServerError } from "@/data/errors/ServerError";
import { RecordTypeModel } from "@/domain/models/postgres/RecordTypesModel";
import { ValidationError } from "yup";
import { mockRecordType } from "@/tests/unit/mocks/recordTypes/mockRecordTypes";
import { EditRecordTypeUseCase } from "@/data/usecases/recordTypes/editRecordTypeUseCase";

export const makeRecordTypeRepository =
  (): jest.Mocked<RecordTypesRepositoryProtocol> => ({
    create: jest.fn(),
    findByNameAndUserId: jest.fn().mockResolvedValue(null),
    findByUserId: jest.fn(),
    findByIdRecordType: jest.fn().mockResolvedValue(mockRecordType),
    updateRecordTypes: jest.fn().mockResolvedValue({
      ...mockRecordType,
      name: "Updated Compras",
      icone: "updated-cart",
      updated_at: new Date(),
    }),
    ...({} as any),
  });

const makeSut = () => {
  const recordTypeRepositorySpy = makeRecordTypeRepository();
  const sut = new EditRecordTypeUseCase(recordTypeRepositorySpy);

  return {
    sut,
    recordTypeRepositorySpy,
  };
};

describe("EditRecordTypeUseCase", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should update a record type successfully with new name and icone", async () => {
    const { sut, recordTypeRepositorySpy } = makeSut();
    const updatedRecordType: RecordTypeModel = {
      ...mockRecordType,
      name: "Updated Compras",
      icone: "updated-cart",
      updated_at: new Date(),
    };
    recordTypeRepositorySpy.findByIdRecordType.mockResolvedValue(
      mockRecordType
    );
    recordTypeRepositorySpy.findByNameAndUserId.mockResolvedValue(null);
    recordTypeRepositorySpy.updateRecordTypes.mockResolvedValue(
      updatedRecordType
    );

    const input = {
      recordTypeId: mockRecordType.id!,
      userId: mockRecordType.user_id,
      name: "Updated Compras",
      icone: "updated-cart",
    };

    const result = await sut.handle(input);

    expect(result).toEqual(updatedRecordType);
    expect(recordTypeRepositorySpy.findByIdRecordType).toHaveBeenCalledWith({
      id: input.recordTypeId,
      userId: input.userId,
    });
    expect(recordTypeRepositorySpy.findByIdRecordType).toHaveBeenCalledTimes(1);
    expect(recordTypeRepositorySpy.findByNameAndUserId).toHaveBeenCalledWith({
      name: input.name,
      userId: input.userId,
    });
    expect(recordTypeRepositorySpy.findByNameAndUserId).toHaveBeenCalledTimes(
      1
    );
    expect(recordTypeRepositorySpy.updateRecordTypes).toHaveBeenCalledWith({
      id: input.recordTypeId,
      userId: input.userId,
      name: input.name,
      icone: input.icone,
    });
    expect(recordTypeRepositorySpy.updateRecordTypes).toHaveBeenCalledTimes(1);
  });

  test("should update a record type successfully without changing name", async () => {
    const { sut, recordTypeRepositorySpy } = makeSut();
    const updatedRecordType: RecordTypeModel = {
      ...mockRecordType,
      icone: "updated-cart",
      updated_at: new Date(),
    };
    recordTypeRepositorySpy.findByIdRecordType.mockResolvedValue(
      mockRecordType
    );
    recordTypeRepositorySpy.updateRecordTypes.mockResolvedValue(
      updatedRecordType
    );

    const input = {
      recordTypeId: mockRecordType.id!,
      userId: mockRecordType.user_id,
      name: mockRecordType.name,
      icone: "updated-cart",
    };

    const result = await sut.handle(input);

    expect(result).toEqual(updatedRecordType);
    expect(recordTypeRepositorySpy.findByIdRecordType).toHaveBeenCalledWith({
      id: input.recordTypeId,
      userId: input.userId,
    });
    expect(recordTypeRepositorySpy.findByIdRecordType).toHaveBeenCalledTimes(1);
    expect(recordTypeRepositorySpy.findByNameAndUserId).not.toHaveBeenCalled();
    expect(recordTypeRepositorySpy.updateRecordTypes).toHaveBeenCalledWith({
      id: input.recordTypeId,
      userId: input.userId,
      name: input.name,
      icone: input.icone,
    });
    expect(recordTypeRepositorySpy.updateRecordTypes).toHaveBeenCalledTimes(1);
  });

  test("should throw ValidationError if id is missing", async () => {
    const { sut, recordTypeRepositorySpy } = makeSut();
    const input = {
      recordTypeId: undefined as any,
      userId: mockRecordType.user_id,
      name: "Updated Compras",
      icone: "updated-cart",
    };

    await expect(sut.handle(input)).rejects.toThrow(ValidationError);
    await expect(sut.handle(input)).rejects.toMatchObject({
      errors: expect.arrayContaining(["ID do Tipo de Registro é obrigatório"]),
    });
    expect(recordTypeRepositorySpy.findByIdRecordType).not.toHaveBeenCalled();
    expect(recordTypeRepositorySpy.findByNameAndUserId).not.toHaveBeenCalled();
    expect(recordTypeRepositorySpy.updateRecordTypes).not.toHaveBeenCalled();
  });

  test("should throw ValidationError if id is not positive", async () => {
    const { sut, recordTypeRepositorySpy } = makeSut();
    const input = {
      recordTypeId: 0,
      userId: mockRecordType.user_id,
      name: "Updated Compras",
      icone: "updated-cart",
    };

    await expect(sut.handle(input)).rejects.toThrow(ValidationError);
    await expect(sut.handle(input)).rejects.toMatchObject({
      errors: expect.arrayContaining(["ID deve ser positivo"]),
    });
    expect(recordTypeRepositorySpy.findByIdRecordType).not.toHaveBeenCalled();
    expect(recordTypeRepositorySpy.findByNameAndUserId).not.toHaveBeenCalled();
    expect(recordTypeRepositorySpy.updateRecordTypes).not.toHaveBeenCalled();
  });

  test("should throw ValidationError if userId is empty", async () => {
    const { sut, recordTypeRepositorySpy } = makeSut();
    const input = {
      recordTypeId: mockRecordType.id!,
      userId: "",
      name: "Updated Compras",
      icone: "updated-cart",
    };

    await expect(sut.handle(input)).rejects.toThrow(ValidationError);
    await expect(sut.handle(input)).rejects.toMatchObject({
      errors: expect.arrayContaining(["ID do Usuário é obrigatório"]),
    });
    expect(recordTypeRepositorySpy.findByIdRecordType).not.toHaveBeenCalled();
    expect(recordTypeRepositorySpy.findByNameAndUserId).not.toHaveBeenCalled();
    expect(recordTypeRepositorySpy.updateRecordTypes).not.toHaveBeenCalled();
  });

  test("should throw BusinessRuleError if record type is not found", async () => {
    const { sut, recordTypeRepositorySpy } = makeSut();
    recordTypeRepositorySpy.findByIdRecordType.mockResolvedValue(null);

    const input = {
      recordTypeId: mockRecordType.id!,
      userId: mockRecordType.user_id,
      name: "Updated Compras",
      icone: "updated-cart",
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
    expect(recordTypeRepositorySpy.findByNameAndUserId).not.toHaveBeenCalled();
    expect(recordTypeRepositorySpy.updateRecordTypes).not.toHaveBeenCalled();
  });

  test("should throw BusinessRuleError if name already exists for another record type", async () => {
    const { sut, recordTypeRepositorySpy } = makeSut();
    const duplicateRecordType: RecordTypeModel = {
      ...mockRecordType,
      id: mockRecordType.id! + 1,
      name: "Updated Compras",
    };
    recordTypeRepositorySpy.findByIdRecordType.mockResolvedValue(
      mockRecordType
    );
    recordTypeRepositorySpy.findByNameAndUserId.mockResolvedValue(
      duplicateRecordType
    );

    const input = {
      recordTypeId: mockRecordType.id!,
      userId: mockRecordType.user_id,
      name: "Updated Compras",
      icone: "updated-cart",
    };

    await expect(sut.handle(input)).rejects.toThrow(
      new BusinessRuleError(
        `Já existe um tipo de registro com o nome "${input.name}" para este usuário`
      )
    );
    expect(recordTypeRepositorySpy.findByIdRecordType).toHaveBeenCalledWith({
      id: input.recordTypeId,
      userId: input.userId,
    });
    expect(recordTypeRepositorySpy.findByIdRecordType).toHaveBeenCalledTimes(1);
    expect(recordTypeRepositorySpy.findByNameAndUserId).toHaveBeenCalledWith({
      name: input.name,
      userId: input.userId,
    });
    expect(recordTypeRepositorySpy.findByNameAndUserId).toHaveBeenCalledTimes(
      1
    );
    expect(recordTypeRepositorySpy.updateRecordTypes).not.toHaveBeenCalled();
  });

  test("should throw ServerError on unexpected error", async () => {
    const { sut, recordTypeRepositorySpy } = makeSut();
    recordTypeRepositorySpy.findByIdRecordType.mockRejectedValue(
      new Error("Database error")
    );

    const input = {
      recordTypeId: mockRecordType.id!,
      userId: mockRecordType.user_id,
      name: "Updated Compras",
      icone: "updated-cart",
    };

    await expect(sut.handle(input)).rejects.toThrow(
      new ServerError("Falha ao editar do record type: Database error")
    );
    expect(recordTypeRepositorySpy.findByIdRecordType).toHaveBeenCalledWith({
      id: input.recordTypeId,
      userId: input.userId,
    });
    expect(recordTypeRepositorySpy.findByIdRecordType).toHaveBeenCalledTimes(1);
    expect(recordTypeRepositorySpy.findByNameAndUserId).not.toHaveBeenCalled();
    expect(recordTypeRepositorySpy.updateRecordTypes).not.toHaveBeenCalled();
  });
});
