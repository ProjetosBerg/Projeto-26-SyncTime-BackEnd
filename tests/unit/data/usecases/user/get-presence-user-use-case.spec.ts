import { AuthenticationRepositoryProtocol } from "@/infra/db/interfaces/authenticationRepositoryProtocol";
import { ServerError } from "@/data/errors/ServerError";
import { Authentication } from "@/domain/entities/postgres/Authentication";
import { GetPresenceUserUseCase } from "@/data/usecases/users/getPresenceUserUseCase";

export const makeAuthenticationRepositoryRepository =
  (): jest.Mocked<AuthenticationRepositoryProtocol> => {
    return {
      findByUserAndPeriod: jest.fn().mockResolvedValue([]),
      ...({} as any),
    };
  };

const makeSut = () => {
  const authenticationRepositorySpy = makeAuthenticationRepositoryRepository();
  const sut = new GetPresenceUserUseCase(authenticationRepositorySpy);

  const data = {
    userId: "mock-user-id",
    month: 2,
    year: 2023,
  };

  return {
    sut,
    authenticationRepositorySpy,
    data,
  };
};

const makeMockAuthentication = (
  loginAt: Date,
  entryCount: number,
  id: string = "mock-id",
  sessionId: string = "mock-session-id"
): Authentication => ({
  id,
  sessionId,
  userId: "mock-user-id",
  user: {
    id: "mock-user-id",
    name: "Mock User",
    email: "mock@example.com",
  },
  loginAt,
  entryCount,
  isOffensive: false,
  createdAt: new Date(),
  updatedAt: new Date(),
  ipAddress: "127.0.0.1",
  userAgent: "mock-agent",
  ...({} as any),
});

describe("GetPresenceUserUseCase", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should return empty presence data when no logins", async () => {
    const { sut, authenticationRepositorySpy, data } = makeSut();

    authenticationRepositorySpy.findByUserAndPeriod.mockResolvedValue([]);

    const result = await sut.handle(data);

    const expectedPresenceData = Array.from({ length: 28 }, (_, i) => ({
      day: String(i + 1).padStart(2, "0"),
      present: false,
      sessions: 0,
    }));

    expect(result.presenceData).toEqual(expectedPresenceData);
    expect(result.stats.presentDays).toBe(0);
    expect(result.stats.totalSessions).toBe(0);
    expect(result.stats.rate).toBe(0);
    expect(
      authenticationRepositorySpy.findByUserAndPeriod
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: data.userId,
        startDate: expect.any(Date),
        endDate: expect.any(Date),
      })
    );
    expect(
      authenticationRepositorySpy.findByUserAndPeriod
    ).toHaveBeenCalledTimes(1);
  });

  test("should calculate presence for one login on day 1 with one session", async () => {
    const { sut, authenticationRepositorySpy, data } = makeSut();

    const loginDate = new Date(2023, 1, 1);
    authenticationRepositorySpy.findByUserAndPeriod.mockResolvedValue([
      makeMockAuthentication(loginDate, 1),
    ]);

    const result = await sut.handle(data);

    const expectedPresenceData = [
      { day: "01", present: true, sessions: 1 },
      ...Array.from({ length: 27 }, (_, i) => ({
        day: String(i + 2).padStart(2, "0"),
        present: false,
        sessions: 0,
      })),
    ];

    expect(result.presenceData).toEqual(expectedPresenceData);
    expect(result.stats.presentDays).toBe(1);
    expect(result.stats.totalSessions).toBe(1);
    expect(result.stats.rate).toBe(4);
  });

  test("should calculate presence for multiple logins on different days with varying sessions", async () => {
    const { sut, authenticationRepositorySpy, data } = makeSut();

    const loginDate1 = new Date(2023, 1, 1);
    const loginDate2 = new Date(2023, 1, 5);
    authenticationRepositorySpy.findByUserAndPeriod.mockResolvedValue([
      makeMockAuthentication(loginDate1, 1, "id1", "session1"),
      makeMockAuthentication(loginDate1, 2, "id2", "session2"),
      makeMockAuthentication(loginDate2, 1, "id3", "session3"),
    ]);

    const result = await sut.handle(data);

    const expectedPresenceData = [
      { day: "01", present: true, sessions: 3 },
      { day: "02", present: false, sessions: 0 },
      { day: "03", present: false, sessions: 0 },
      { day: "04", present: false, sessions: 0 },
      { day: "05", present: true, sessions: 1 },
      ...Array.from({ length: 23 }, (_, i) => ({
        day: String(i + 6).padStart(2, "0"),
        present: false,
        sessions: 0,
      })),
    ];

    expect(result.presenceData).toEqual(expectedPresenceData);
    expect(result.stats.presentDays).toBe(2);
    expect(result.stats.totalSessions).toBe(4);
    expect(result.stats.rate).toBe(7);
  });

  test("should throw ServerError for unexpected errors", async () => {
    const { sut, authenticationRepositorySpy, data } = makeSut();

    authenticationRepositorySpy.findByUserAndPeriod.mockRejectedValue(
      new Error("Database error")
    );

    await expect(sut.handle(data)).rejects.toThrow(
      new ServerError("Falha ao obter dados de presença: Database error")
    );
    expect(
      authenticationRepositorySpy.findByUserAndPeriod
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: data.userId,
        startDate: expect.any(Date),
        endDate: expect.any(Date),
      })
    );
    expect(
      authenticationRepositorySpy.findByUserAndPeriod
    ).toHaveBeenCalledTimes(1);
  });
});
