import { UserMonthlyEntryRankRepositoryProtocol } from "@/infra/db/interfaces/userMonthlyEntryRankRepositoryProtocol";
import { ServerError } from "@/data/errors/ServerError";
import { ValidationError } from "yup";
import { GetByUserIdRankUserUseCase } from "@/data/usecases/users/getByUserIdRankUserUseCase";

export const makeUserMonthlyEntryRankRepository =
  (): jest.Mocked<UserMonthlyEntryRankRepositoryProtocol> => ({
    getAllRankedForMonthPaginated: jest
      .fn()
      .mockResolvedValue({ rankedUsers: [], total: 0 }),
    getUserRankForMonth: jest.fn().mockResolvedValue(undefined),
    findOneRankUser: jest.fn().mockResolvedValue(undefined),
    ...({} as any),
  });

const makeSut = () => {
  const userMonthlyEntryRankRepositorySpy =
    makeUserMonthlyEntryRankRepository();
  const sut = new GetByUserIdRankUserUseCase(userMonthlyEntryRankRepositorySpy);

  return {
    sut,
    userMonthlyEntryRankRepositorySpy,
  };
};

describe("GetByUserIdRankUserUseCase", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should get top10 and myRank from top10 if user is in top10", async () => {
    const { sut, userMonthlyEntryRankRepositorySpy } = makeSut();
    const mockTop10 = [{ userId: "test-id", totalEntries: 20, rank: 5 }];
    userMonthlyEntryRankRepositorySpy.getAllRankedForMonthPaginated.mockResolvedValue(
      {
        rankedUsers: mockTop10,
        total: 1,
      }
    );

    const input = {
      userId: "test-id",
      year: 2025,
      month: 12,
    };

    const result = await sut.handle(input);

    expect(result).toEqual({
      top10: mockTop10,
      myRank: undefined,
    });
    expect(
      userMonthlyEntryRankRepositorySpy.getAllRankedForMonthPaginated
    ).toHaveBeenCalledWith({
      year: input.year,
      month: input.month,
      page: 1,
      limit: 10,
      order: "DESC",
    });
    expect(
      userMonthlyEntryRankRepositorySpy.getUserRankForMonth
    ).not.toHaveBeenCalled();
    expect(
      userMonthlyEntryRankRepositorySpy.findOneRankUser
    ).not.toHaveBeenCalled();
  });

  test("should get top10 and fetch myRank separately if user not in top10", async () => {
    const { sut, userMonthlyEntryRankRepositorySpy } = makeSut();
    const mockTop10 = [{ userId: "top-id", totalEntries: 20, rank: 1 }];
    userMonthlyEntryRankRepositorySpy.getAllRankedForMonthPaginated.mockResolvedValue(
      {
        rankedUsers: mockTop10,
        total: 1,
      }
    );
    const mockRank = 15;
    userMonthlyEntryRankRepositorySpy.getUserRankForMonth.mockResolvedValue(
      mockRank
    );
    const mockUserRecord = { userId: "test-id", totalEntries: 5 };
    userMonthlyEntryRankRepositorySpy.findOneRankUser.mockResolvedValue(
      mockUserRecord as any
    );

    const input = {
      userId: "test-id",
      year: 2025,
      month: 12,
    };

    const result = await sut.handle(input);

    expect(result).toEqual({
      top10: mockTop10,
      myRank: {
        userId: mockUserRecord.userId,
        totalEntries: mockUserRecord.totalEntries,
        rank: mockRank,
      },
    });
    expect(
      userMonthlyEntryRankRepositorySpy.getAllRankedForMonthPaginated
    ).toHaveBeenCalledWith({
      year: input.year,
      month: input.month,
      page: 1,
      limit: 10,
      order: "DESC",
    });
    expect(
      userMonthlyEntryRankRepositorySpy.getUserRankForMonth
    ).toHaveBeenCalledWith({
      userId: input.userId,
      year: input.year,
      month: input.month,
    });
    expect(
      userMonthlyEntryRankRepositorySpy.findOneRankUser
    ).toHaveBeenCalledWith({
      userId: input.userId,
      year: input.year,
      month: input.month,
    });
  });

  test("should return undefined myRank if no record found", async () => {
    const { sut, userMonthlyEntryRankRepositorySpy } = makeSut();
    const mockTop10 = [{ userId: "top-id", totalEntries: 20, rank: 1 }];
    userMonthlyEntryRankRepositorySpy.getAllRankedForMonthPaginated.mockResolvedValue(
      {
        rankedUsers: mockTop10,
        total: 1,
      }
    );
    userMonthlyEntryRankRepositorySpy.findOneRankUser.mockResolvedValue(
      undefined as any
    );

    const input = {
      userId: "test-id",
      year: 2025,
      month: 12,
    };

    const result = await sut.handle(input);

    expect(result).toEqual({
      top10: mockTop10,
      myRank: undefined,
    });
    expect(
      userMonthlyEntryRankRepositorySpy.getUserRankForMonth
    ).not.toHaveBeenCalled();
  });

  test("should throw ValidationError if userId is empty", async () => {
    const { sut, userMonthlyEntryRankRepositorySpy } = makeSut();
    const input = {
      userId: "",
      year: 2025,
      month: 12,
    };

    await expect(sut.handle(input)).rejects.toThrow(ValidationError);
    await expect(sut.handle(input)).rejects.toMatchObject({
      errors: expect.arrayContaining(["ID do Usuário é obrigatório"]),
    });
    expect(
      userMonthlyEntryRankRepositorySpy.getAllRankedForMonthPaginated
    ).not.toHaveBeenCalled();
  });

  test("should throw ValidationError if year is invalid", async () => {
    const { sut, userMonthlyEntryRankRepositorySpy } = makeSut();
    const input = {
      userId: "test-id",
      year: 1899,
      month: 12,
    };

    await expect(sut.handle(input)).rejects.toThrow(ValidationError);
    await expect(sut.handle(input)).rejects.toMatchObject({
      errors: expect.arrayContaining(["Ano deve ser entre 1900 e 2100"]),
    });
    expect(
      userMonthlyEntryRankRepositorySpy.getAllRankedForMonthPaginated
    ).not.toHaveBeenCalled();
  });

  test("should throw ValidationError if month is invalid", async () => {
    const { sut, userMonthlyEntryRankRepositorySpy } = makeSut();
    const input = {
      userId: "test-id",
      year: 2025,
      month: 13,
    };

    await expect(sut.handle(input)).rejects.toThrow(ValidationError);
    await expect(sut.handle(input)).rejects.toMatchObject({
      errors: expect.arrayContaining(["Mês deve ser entre 1 e 12"]),
    });
    expect(
      userMonthlyEntryRankRepositorySpy.getAllRankedForMonthPaginated
    ).not.toHaveBeenCalled();
  });

  test("should throw ServerError on unexpected error", async () => {
    const { sut, userMonthlyEntryRankRepositorySpy } = makeSut();
    userMonthlyEntryRankRepositorySpy.getAllRankedForMonthPaginated.mockRejectedValue(
      new Error("Database error")
    );

    const input = {
      userId: "test-id",
      year: 2025,
      month: 12,
    };

    await expect(sut.handle(input)).rejects.toThrow(
      new ServerError("Falha na busca de rank do usuário: Database error")
    );
    expect(
      userMonthlyEntryRankRepositorySpy.getAllRankedForMonthPaginated
    ).toHaveBeenCalledTimes(1);
  });
});
