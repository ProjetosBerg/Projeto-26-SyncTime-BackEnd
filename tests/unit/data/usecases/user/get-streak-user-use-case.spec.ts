import { AuthenticationRepositoryProtocol } from "@/infra/db/interfaces/authenticationRepositoryProtocol";
import { ServerError } from "@/data/errors/ServerError";
import { GetStreakUserUseCase } from "@/data/usecases/users/getStreakUserUseCase";

export const makeAuthenticationRepositoryRepository =
  (): jest.Mocked<AuthenticationRepositoryProtocol> => {
    return {
      hasOffensiveLoginInDay: jest.fn().mockResolvedValue(false),
      ...({} as any),
    };
  };

const makeSut = () => {
  const authenticationRepositorySpy = makeAuthenticationRepositoryRepository();
  const sut = new GetStreakUserUseCase(authenticationRepositorySpy);

  const data = {
    userId: "mock-user-id",
  };

  return {
    sut,
    authenticationRepositorySpy,
    data,
  };
};

describe("GetStreakUserUseCase", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should return streak 0 and week progress 0 when no offensive logins", async () => {
    const { sut, authenticationRepositorySpy, data } = makeSut();

    authenticationRepositorySpy.hasOffensiveLoginInDay.mockResolvedValue(false);

    const result = await sut.handle(data);

    expect(result.streakDays).toBe(0);
    expect(result.weekProgress).toHaveLength(7);
    expect(result.weekProgress).toEqual([
      false,
      false,
      false,
      false,
      false,
      false,
      false,
    ]);
    expect((result as any).completedDaysThisWeek).toBe(0);
    expect(
      authenticationRepositorySpy.hasOffensiveLoginInDay
    ).toHaveBeenCalled();
  });

  test("should calculate streak of 1 (only today) and update week progress accordingly", async () => {
    const { sut, authenticationRepositorySpy, data } = makeSut();

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayDayOfWeek = today.getDay();

    authenticationRepositorySpy.hasOffensiveLoginInDay.mockImplementation(
      ({ date }) => {
        const checkDate = new Date(date);
        checkDate.setHours(0, 0, 0, 0);
        const diffTime = today.getTime() - checkDate.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        return Promise.resolve(diffDays === 0);
      }
    );

    const result = await sut.handle(data);

    expect(result.streakDays).toBe(1);

    expect(result.weekProgress).toHaveLength(7);

    const trueDays = result.weekProgress.filter(Boolean).length;
    expect(trueDays).toBe(1);

    expect(result.weekProgress[todayDayOfWeek]).toBe(true);

    result.weekProgress.forEach((hasLogin, index) => {
      if (index === todayDayOfWeek) {
        expect(hasLogin).toBe(true);
      } else {
        expect(hasLogin).toBe(false);
      }
    });

    expect((result as any).completedDaysThisWeek).toBe(1);

    expect(
      authenticationRepositorySpy.hasOffensiveLoginInDay
    ).toHaveBeenCalled();
  });

  test("should calculate streak of 3 and update week progress accordingly", async () => {
    const { sut, authenticationRepositorySpy, data } = makeSut();

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayDayOfWeek = today.getDay();

    authenticationRepositorySpy.hasOffensiveLoginInDay.mockImplementation(
      ({ date }) => {
        const checkDate = new Date(date);
        checkDate.setHours(0, 0, 0, 0);
        const diffTime = today.getTime() - checkDate.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        return Promise.resolve(diffDays >= 0 && diffDays < 3);
      }
    );

    const result = await sut.handle(data);

    expect(result.streakDays).toBe(3);

    expect(result.weekProgress).toHaveLength(7);

    const expectedCompletedDays = Math.min(3, todayDayOfWeek + 1);

    expect((result as any).completedDaysThisWeek).toBe(expectedCompletedDays);

    for (let i = 0; i < 7; i++) {
      if (i <= todayDayOfWeek && i > todayDayOfWeek - 3) {
        expect(result.weekProgress[i]).toBe(true);
      } else {
        expect(result.weekProgress[i]).toBe(false);
      }
    }

    expect(
      authenticationRepositorySpy.hasOffensiveLoginInDay
    ).toHaveBeenCalled();
  });

  test("should throw ServerError for unexpected errors", async () => {
    const { sut, authenticationRepositorySpy, data } = makeSut();

    authenticationRepositorySpy.hasOffensiveLoginInDay.mockRejectedValue(
      new Error("Database error")
    );

    await expect(sut.handle(data)).rejects.toThrow(
      new ServerError("Falha ao obter dados de streak: Database error")
    );
    expect(
      authenticationRepositorySpy.hasOffensiveLoginInDay
    ).toHaveBeenCalled();
  });
});
