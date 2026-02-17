import { ServerError } from "@/data/errors/ServerError";
import { BusinessRuleError } from "@/data/errors/BusinessRuleError";
import { NotFoundError } from "@/data/errors/NotFoundError";
import { NotesModel } from "@/domain/models/postgres/NotesModel";
import { NotesRepositoryProtocol } from "@/infra/db/interfaces/notesRepositoryProtocol";
import { RoutinesRepositoryProtocol } from "@/infra/db/interfaces/routinesRepositoryProtocol";
import { CategoryRepositoryProtocol } from "@/infra/db/interfaces/categoryRepositoryProtocol";
import { NotificationRepositoryProtocol } from "@/infra/db/interfaces/notificationRepositoryProtocol";
import { EditNotesUseCaseProtocol } from "../interfaces/notes/editNotesUseCaseProtocol";
import { editNotesValidationSchema } from "../validation/notes/editNotesValidationSchema";
import { NotificationModel } from "@/domain/models/postgres/NotificationModel";

import { getIo } from "@/lib/socket";
import logger from "@/loaders/logger";

/**
 * Edita uma Anotação existente para um usuário
 */
export class EditNotesUseCase implements EditNotesUseCaseProtocol {
  constructor(
    private readonly notesRepository: NotesRepositoryProtocol,
    private readonly routinesRepository: RoutinesRepositoryProtocol,
    private readonly categoryRepository: CategoryRepositoryProtocol,
    private readonly notificationRepository: NotificationRepositoryProtocol
  ) {}

  async handle(data: EditNotesUseCaseProtocol.Params): Promise<NotesModel> {
    try {
      await editNotesValidationSchema.validate(data, {
        abortEarly: false,
      });

      let routineModel: any;

      const existingNote = await this.notesRepository.findByIdAndUserId({
        id: data.noteId,
        userId: data.userId,
      });

      if (!existingNote) {
        throw new NotFoundError(
          `Anotação com ID ${data.noteId} não encontrada para este usuário`
        );
      }

      const newRoutineId = data.routine_id || existingNote.routine_id;
      if (data.routine_id && data.routine_id !== existingNote.routine_id) {
        const existingRoutine = await this.routinesRepository.findByIdAndUserId(
          {
            id: newRoutineId,
            userId: data.userId,
          }
        );

        routineModel = existingRoutine;

        if (!existingRoutine) {
          throw new BusinessRuleError(
            `Nenhuma rotina encontrada com o ID ${newRoutineId} para este usuário`
          );
        }
      }

      const newCategoryId =
        data.category_id !== undefined
          ? data.category_id
          : existingNote.category_id;
      if (
        data.category_id !== undefined &&
        data.category_id !== existingNote.category_id
      ) {
        const existingCategory =
          await this.categoryRepository.findByIdAndUserId({
            id: newCategoryId!,
            userId: data.userId,
          });

        if (!existingCategory) {
          throw new BusinessRuleError(
            `Nenhuma categoria encontrada com o ID ${newCategoryId} para este usuário`
          );
        }
      }

      const updatedNote = await this.notesRepository.updateNote({
        status: data.status,
        collaborators: data.collaborators,
        priority: data.priority,
        category_id: data.category_id,
        activity: data.activity,
        activityType: data.activityType,
        description: data.description,
        startTime: data.startTime,
        endTime: data.endTime,
        comments: data.comments,
        routine_id: data.routine_id,
        id: data.noteId,
        userId: data.userId,
      });

      const newNotification = await this.notificationRepository.create({
        title: `Anotação atualizada: ${updatedNote.activity}`,
        entity: "Anotação",
        idEntity: data.noteId,
        userId: data.userId,
        path: `/anotacoes`,
        payload: {
          activity: updatedNote.activity,
          status: updatedNote.status,
          priority: updatedNote.priority,
          activityType: updatedNote.activityType,
          startTime: updatedNote.startTime,
          endTime: updatedNote.endTime,
          routine_id: updatedNote.routine_id,
          category_id: updatedNote.category_id,
          routine: routineModel || null,
        } as NotificationModel["payload"],
        typeOfAction: "Atualização",
      });

      const countNewNotification =
        await this.notificationRepository.countNewByUserId({
          userId: data.userId,
        });

      const io = getIo();
      const now = new Date();
      if (io && newNotification) {
        const notificationData = {
          id: newNotification.id,
          title: newNotification.title,
          entity: newNotification.entity,
          idEntity: newNotification.idEntity,
          path: newNotification.path,
          typeOfAction: newNotification.typeOfAction,
          payload: newNotification.payload,
          createdAt: new Date(now.getTime() + 6 * 60 * 60 * 1000),
          countNewNotification,
        };

        io.to(`user_${data.userId}`).emit("newNotification", notificationData);
        logger.info(
          `Notificação de atualização de anotação emitida via Socket.IO para userId: ${data.userId} (count: ${countNewNotification})`
        );
      } else {
        logger.warn(
          "Socket.IO não inicializado ou notificação nula → edição realizada, mas sem push em tempo real"
        );
      }

      return updatedNote;
    } catch (error: any) {
      if (error.name === "ValidationError") {
        throw error;
      }

      if (
        error instanceof BusinessRuleError ||
        error instanceof NotFoundError
      ) {
        throw error;
      }

      const errorMessage =
        error.message || "Erro interno do servidor durante a edição";
      throw new ServerError(`Falha na edição de Anotação: ${errorMessage}`);
    }
  }
}
