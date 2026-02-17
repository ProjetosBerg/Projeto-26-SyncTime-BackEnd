import { ServerError } from "@/data/errors/ServerError";
import { NotFoundError } from "@/data/errors/NotFoundError";
import { NotesRepositoryProtocol } from "@/infra/db/interfaces/notesRepositoryProtocol";
import { NotificationRepositoryProtocol } from "@/infra/db/interfaces/notificationRepositoryProtocol";
import { DeleteNotesUseCaseProtocol } from "../interfaces/notes/deleteNotesUseCaseProtocol";
import { deleteNotesValidationSchema } from "../validation/notes/deleteNotesValidationSchema";
import { NotificationModel } from "@/domain/models/postgres/NotificationModel";

// NOVO: Socket.IO
import { getIo } from "@/lib/socket";
import logger from "@/loaders/logger";

/**
 * Deleta uma Anotação existente para um usuário
 */
export class DeleteNotesUseCase implements DeleteNotesUseCaseProtocol {
  constructor(
    private readonly notesRepository: NotesRepositoryProtocol,
    private readonly notificationRepository: NotificationRepositoryProtocol
  ) {}

  async handle(data: DeleteNotesUseCaseProtocol.Params): Promise<void> {
    try {
      await deleteNotesValidationSchema.validate(data, {
        abortEarly: false,
      });

      const existingNote = await this.notesRepository.findByIdAndUserId({
        id: data.noteId,
        userId: data.userId,
      });

      if (!existingNote) {
        throw new NotFoundError(
          `Anotação com ID ${data.noteId} não encontrada para este usuário`
        );
      }

      await this.notesRepository.deleteNote({
        id: data.noteId,
        userId: data.userId,
      });

      const newNotification = await this.notificationRepository.create({
        title: `Anotação excluída: ${existingNote.activity}`,
        entity: "Anotação",
        idEntity: data.noteId,
        userId: data.userId,
        path: `/anotacoes`,
        typeOfAction: "Exclusão",
        payload: {
          activity: existingNote.activity,
          activityType: existingNote.activityType,
          priority: existingNote.priority,
          startTime: existingNote.startTime,
          endTime: existingNote.endTime,
          routine_id: existingNote.routine_id,
        } as NotificationModel["payload"],
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
          `Notificação de exclusão de anotação emitida via Socket.IO para userId: ${data.userId} (count: ${countNewNotification})`
        );
      } else {
        logger.warn(
          "Socket.IO não inicializado ou notificação nula → exclusão realizada, mas sem push em tempo real"
        );
      }
    } catch (error: any) {
      if (error.name === "ValidationError") {
        throw error;
      }

      if (error instanceof NotFoundError) {
        throw error;
      }

      const errorMessage =
        error.message || "Erro interno do servidor durante a deleção";
      throw new ServerError(`Falha na deleção de anotação: ${errorMessage}`);
    }
  }
}
