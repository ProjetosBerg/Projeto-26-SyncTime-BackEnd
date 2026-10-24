import { GoalService } from "@/data/usecases/goals/goalService";
import { GoalRepositoryProtocol } from "@/infra/db/interfaces/goalRepositoryProtocol";

const makeRepository = (): jest.Mocked<GoalRepositoryProtocol> => ({
  create: jest.fn(),
  findByUserId: jest.fn(),
  findByIdAndUserId: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
});

describe("GoalService", () => {
  test("should create a productivity goal", async () => {
    const repository = makeRepository();
    const service = new GoalService(repository);
    repository.create.mockResolvedValue({
      title: "Concluir atividades",
      targetCount: 10,
      startDate: "2026-10-01",
      endDate: "2026-10-31",
    });

    await service.create("user-1", {
      title: "Concluir atividades",
      targetCount: 10,
      startDate: "2026-10-01",
      endDate: "2026-10-31",
    });

    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({ userId: "user-1", targetCount: 10 })
    );
  });

  test("should reject an invalid date range", async () => {
    const repository = makeRepository();
    const service = new GoalService(repository);

    await expect(
      service.create("user-1", {
        title: "Meta inválida",
        targetCount: 5,
        startDate: "2026-11-01",
        endDate: "2026-10-01",
      })
    ).rejects.toThrow("A data final deve ser igual ou posterior à inicial");
    expect(repository.create).not.toHaveBeenCalled();
  });

  test("should update only the supplied fields", async () => {
    const repository = makeRepository();
    const service = new GoalService(repository);
    repository.findByIdAndUserId.mockResolvedValue({
      id: "goal-1",
      title: "Meta atual",
      targetCount: 10,
      startDate: "2026-10-01",
      endDate: "2026-10-31",
    });
    repository.update.mockResolvedValue({
      id: "goal-1",
      title: "Nova meta",
      targetCount: 10,
      startDate: "2026-10-01",
      endDate: "2026-10-31",
    });

    await service.update("goal-1", "user-1", { title: "Nova meta" });

    expect(repository.update).toHaveBeenCalledWith({
      id: "goal-1",
      userId: "user-1",
      title: "Nova meta",
    });
  });
});
