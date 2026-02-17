// tests/unit/usecases/user/getInboxUserUseCase.spec.ts

import { NotesRepositoryProtocol } from "@/infra/db/interfaces/notesRepositoryProtocol";
import { CategoryRepositoryProtocol } from "@/infra/db/interfaces/categoryRepositoryProtocol";
import { MonthlyRecordRepositoryProtocol } from "@/infra/db/interfaces/monthlyRecordRepositoryProtocol";
import { RoutinesRepositoryProtocol } from "@/infra/db/interfaces/routinesRepositoryProtocol";
import { CustomFieldsRepositoryProtocol } from "@/infra/db/interfaces/customFieldsRepositoryProtocol";
import { ServerError } from "@/data/errors/ServerError";
import { mockCategory } from "@/tests/unit/mocks/category/mockCategory";
import { mockMonthlyRecord } from "@/tests/unit/mocks/monthlyRecord/mockMonthlyRecord";
import { GetInboxUserUseCase } from "@/data/usecases/users/getInboxUserUseCase";
import { mockCustomField } from "@/tests/unit/mocks/customFields/mockCustomFields";
import { mockRoutine } from "@/tests/unit/mocks/routines/mockRoutines";
import { mockNotes } from "@/tests/unit/mocks/notes/mockNotes";

const makeNotesRepository = (): jest.Mocked<NotesRepositoryProtocol> => ({
  findByUserId: jest.fn().mockResolvedValue({
    notes: [mockNotes],
    total: 1,
  }),
  create: jest.fn(),
  findByIdAndUserId: jest.fn(),
  updateNote: jest.fn(),
  deleteNote: jest.fn(),
  findByUserIdAndDate: jest.fn(),
  findByUserIdAndSummaryDate: jest.fn(),
});

const makeCategoryRepository = (): jest.Mocked<CategoryRepositoryProtocol> => ({
  findByUserId: jest.fn().mockResolvedValue({
    categories: [mockCategory],
    total: 1,
  }),
  create: jest.fn(),
  findByNameAndUserId: jest.fn(),
  findByIdAndUserId: jest.fn(),
  deleteCategory: jest.fn(),
  updateCategory: jest.fn(),
});

const makeMonthlyRecordRepository =
  (): jest.Mocked<MonthlyRecordRepositoryProtocol> => ({
    findAllByUserId: jest.fn().mockResolvedValue({
      records: [mockMonthlyRecord],
      total: 1,
    }),
    create: jest.fn(),
    findOneMonthlyRecord: jest.fn(),
    findByUserId: jest.fn(),
    findByIdAndUserId: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  });

const makeRoutinesRepository = (): jest.Mocked<RoutinesRepositoryProtocol> => ({
  findByUserId: jest.fn().mockResolvedValue({
    routines: [mockRoutine],
    total: 1,
  }),
  create: jest.fn(),
  findByTypeAndPeriodAndUserId: jest.fn(),
  findByPeriodAndUserIdAndDateRange: jest.fn(),
  findByIdAndUserId: jest.fn(),
  deleteRoutine: jest.fn(),
  updateRoutine: jest.fn(),
});

const makeCustomFieldsRepository =
  (): jest.Mocked<CustomFieldsRepositoryProtocol> => ({
    findByUserId: jest.fn().mockResolvedValue({
      customFields: [mockCustomField],
      total: 1,
    }),
    create: jest.fn(),
    findByNameAndUserId: jest.fn(),
    findByRecordTypeId: jest.fn(),
    findByIdsAndUserId: jest.fn(),
    findByIdAndUserId: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  });

const makeSut = () => {
  const notesRepositorySpy = makeNotesRepository();
  const categoryRepositorySpy = makeCategoryRepository();
  const monthlyRecordRepositorySpy = makeMonthlyRecordRepository();
  const routinesRepositorySpy = makeRoutinesRepository();
  const customFieldsRepositorySpy = makeCustomFieldsRepository();

  const sut = new GetInboxUserUseCase(
    notesRepositorySpy,
    categoryRepositorySpy,
    monthlyRecordRepositorySpy,
    routinesRepositorySpy,
    customFieldsRepositorySpy
  );

  return {
    sut,
    notesRepositorySpy,
    categoryRepositorySpy,
    monthlyRecordRepositorySpy,
    routinesRepositorySpy,
    customFieldsRepositorySpy,
  };
};

describe("GetInboxUserUseCase", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // test("should return combined inbox items from all sources sorted by updated_at DESC", async () => {
  //   const {
  //     sut,
  //     notesRepositorySpy,
  //     categoryRepositorySpy,
  //     monthlyRecordRepositorySpy,
  //     routinesRepositorySpy,
  //     customFieldsRepositorySpy,
  //   } = makeSut();

  //   const mockDate = new Date("2025-11-18T10:00:00Z");
  //   const olderDate = new Date("2025-11-17T10:00:00Z");

  //   // Simulando diferentes datas para testar ordenação
  //   notesRepositorySpy.findByUserId.mockResolvedValue({
  //     notes: [{ ...mockNotes, updated_at: mockDate }],
  //     total: 1,
  //   });
  //   categoryRepositorySpy.findByUserId.mockResolvedValue({
  //     categories: [{ ...mockCategory, updated_at: olderDate }],
  //     total: 1,
  //   });
  //   monthlyRecordRepositorySpy.findAllByUserId.mockResolvedValue({
  //     records: [{ ...mockMonthlyRecord, updated_at: mockDate }],
  //     total: 1,
  //   });
  //   routinesRepositorySpy.findByUserId.mockResolvedValue({
  //     routines: [{ ...mockRoutine, updated_at: olderDate }],
  //     total: 1,
  //   });
  //   customFieldsRepositorySpy.findByUserId.mockResolvedValue({
  //     customFields: [{ ...mockCustomField, updated_at: mockDate }],
  //     total: 1,
  //   });

  //   const result = await sut.handle({ userId: "user-123" });

  //   expect(result).toHaveLength(5);
  //   expect(result[0].type).toBe("note"); // mais recente
  //   expect(result[0].title).toBe(mockNotes.activity);
  //   expect(result[0].path).toBe(`/anotacoes`);
  //   expect(result[0].entityRef).toEqual({
  //     routineId: mockNotes.routine_id,
  //     categoryId: mockNotes.category_id,
  //   });

  //   expect(result[1].type).toBe("monthly_record");
  //   expect(result[1].path).toBe(
  //     `/relatorios/categoria/relatorio-mesal/${mockMonthlyRecord.id}`
  //   );

  //   expect(result[2].type).toBe("Custom_fields");
  //   expect(result[2].path).toBe(`/custom-fields`);

  //   // Verifica chamadas com parâmetros corretos
  //   expect(notesRepositorySpy.findByUserId).toHaveBeenCalledWith({
  //     userId: "user-123",
  //     page: 1,
  //     limit: 3,
  //     sortBy: "updated_at",
  //     order: "DESC",
  //   });
  //   expect(monthlyRecordRepositorySpy.findAllByUserId).toHaveBeenCalledWith({
  //     userId: "user-123",
  //     page: 1,
  //     limit: 3,
  //     sortBy: "updated_at",
  //     order: "DESC",
  //   });
  //   expect(customFieldsRepositorySpy.findByUserId).toHaveBeenCalledWith({
  //     user_id: "user-123",
  //     page: 1,
  //     limit: 3,
  //     sortBy: "updated_at",
  //     order: "DESC",
  //   });
  // });

  test("should return empty array when no items exist in any repository", async () => {
    const {
      sut,
      notesRepositorySpy,
      categoryRepositorySpy,
      monthlyRecordRepositorySpy,
      routinesRepositorySpy,
      customFieldsRepositorySpy,
    } = makeSut();

    notesRepositorySpy.findByUserId.mockResolvedValue({ notes: [], total: 0 });
    categoryRepositorySpy.findByUserId.mockResolvedValue({
      categories: [],
      total: 0,
    });
    monthlyRecordRepositorySpy.findAllByUserId.mockResolvedValue({
      records: [],
      total: 0,
    });
    routinesRepositorySpy.findByUserId.mockResolvedValue({
      routines: [],
      total: 0,
    });
    customFieldsRepositorySpy.findByUserId.mockResolvedValue({
      customFields: [],
      total: 0,
    });

    const result = await sut.handle({ userId: "user-123" });

    expect(result).toEqual([]);
  });

  test("should limit to 12 items even if more than 12 are returned", async () => {
    const { sut } = makeSut();

    const manyItems = Array(20)
      .fill(null)
      .map((_, i) => ({
        ...mockNotes,
        id: `note-${i}`,
        activity: `Atividade ${i}`,
        updated_at: new Date(`2025-11-18T${20 - i}:00:00Z`), // ordenado do mais recente ao mais antigo
      }));

    // Sobrescreve apenas o notes para ter muitos itens
    jest.spyOn(sut["notesRepository"], "findByUserId").mockResolvedValue({
      notes: manyItems,
      total: 20,
    });

    const result = await sut.handle({ userId: "user-123" });

    expect(result).toHaveLength(12);
    expect(result[0].title).toBe("Atividade 0"); // mais recente
    expect(result[11].title).toBe("Atividade 11");
  });

  test("should throw ServerError if any repository throws an error", async () => {
    const { sut, notesRepositorySpy } = makeSut();

    notesRepositorySpy.findByUserId.mockRejectedValue(
      new Error("Connection timeout")
    );

    await expect(sut.handle({ userId: "user-123" })).rejects.toThrow(
      new ServerError("Erro ao carregar inbox: Connection timeout")
    );
  });

  test("should handle missing optional fields gracefully", async () => {
    const { sut, notesRepositorySpy } = makeSut();

    notesRepositorySpy.findByUserId.mockResolvedValue({
      notes: [
        {
          ...mockNotes,
          activity: "",
          category_id: null as any,
          updated_at: new Date(),
        },
      ],
      total: 1,
    });

    const result = await sut.handle({ userId: "user-123" });

    expect(result[0].title).toBe("Sem título");
    expect(result[0].entityRef).toEqual({
      routineId: mockNotes.routine_id,
      categoryId: null,
    });
  });
});
