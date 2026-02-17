import { RecordTypesRepositoryProtocol } from "@/infra/db/interfaces/recordTypesRepositoryProtocol";
import { BusinessRuleError } from "@/data/errors/BusinessRuleError";
import { ServerError } from "@/data/errors/ServerError";
import { ValidationError } from "yup";
import { mockRecordType } from "@/tests/unit/mocks/recordTypes/mockRecordTypes";
import { GetByUserIdRecordTypeUseCase } from "@/data/usecases/recordTypes/getByUserIdRecordTypesUseCase";

export const makeRecordTypeRepository =
  (): jest.Mocked<RecordTypesRepositoryProtocol> => ({
    create: jest.fn(),
    findByNameAndUserId: jest.fn(),
    findByUserId: jest.fn().mockResolvedValue([mockRecordType]),
    ...({} as any),
  });

const makeSut = () => {
  const recordTypeRepositorySpy = makeRecordTypeRepository();
  const sut = new GetByUserIdRecordTypeUseCase(recordTypeRepositorySpy);

  return {
    sut,
    recordTypeRepositorySpy,
  };
};

describe("GetByUserIdRecordTypeUseCase", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should return record types for valid userId", async () => {
    const { sut, recordTypeRepositorySpy } = makeSut();
    recordTypeRepositorySpy.findByUserId.mockResolvedValue({
      recordTypes: [mockRecordType],
      total: 1,
    });

    const input = { userId: mockRecordType.user_id };
    const result = await sut.handle(input);

    expect(result).toEqual({
      recordTypes: [mockRecordType],
      total: 1,
    });
    expect(recordTypeRepositorySpy.findByUserId).toHaveBeenCalledWith({
      userId: input.userId,
      page: 1,
      limit: 10,
      search: undefined,
      sortBy: "name",
      order: "ASC",
    });
    expect(recordTypeRepositorySpy.findByUserId).toHaveBeenCalledTimes(1);
  });

  test("should throw ValidationError if userId is empty", async () => {
    const { sut, recordTypeRepositorySpy } = makeSut();
    const input = { userId: "" };

    await expect(sut.handle(input)).rejects.toThrow(ValidationError);
    await expect(sut.handle(input)).rejects.toMatchObject({
      errors: expect.arrayContaining(["ID do Usuário é obrigatório"]),
    });
    expect(recordTypeRepositorySpy.findByUserId).not.toHaveBeenCalled();
  });

  test("should throw BusinessRuleError if no record types are found", async () => {
    const { sut, recordTypeRepositorySpy } = makeSut();
    recordTypeRepositorySpy.findByUserId.mockResolvedValue({
      recordTypes: [],
      total: 0,
    });

    const input = { userId: mockRecordType.user_id };
    await expect(sut.handle(input)).rejects.toThrow(
      new BusinessRuleError(
        "Nenhum tipo de registro encontrado para este usuário"
      )
    );
    expect(recordTypeRepositorySpy.findByUserId).toHaveBeenCalledWith({
      userId: input.userId,
      page: 1,
      limit: 10,
      search: undefined,
      sortBy: "name",
      order: "ASC",
    });
    expect(recordTypeRepositorySpy.findByUserId).toHaveBeenCalledTimes(1);
  });

  test("should throw ServerError on unexpected error", async () => {
    const { sut, recordTypeRepositorySpy } = makeSut();
    recordTypeRepositorySpy.findByUserId.mockRejectedValue(
      new Error("Database error")
    );

    const input = { userId: mockRecordType.user_id };
    await expect(sut.handle(input)).rejects.toThrow(
      new ServerError("Falha na busca de record types: Database error")
    );
    expect(recordTypeRepositorySpy.findByUserId).toHaveBeenCalledWith({
      userId: input.userId,
      page: 1,
      limit: 10,
      search: undefined,
      sortBy: "name",
      order: "ASC",
    });
    expect(recordTypeRepositorySpy.findByUserId).toHaveBeenCalledTimes(1);
  });
});
