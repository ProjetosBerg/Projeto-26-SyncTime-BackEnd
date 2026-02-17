import { ServerError } from "@/data/errors/ServerError";
import { BusinessRuleError } from "@/data/errors/BusinessRuleError";
import { NotesModel } from "@/domain/models/postgres/NotesModel";
import { RoutinesRepositoryProtocol } from "@/infra/db/interfaces/routinesRepositoryProtocol";
import { CategoryRepositoryProtocol } from "@/infra/db/interfaces/categoryRepositoryProtocol";
import { NotificationRepositoryProtocol } from "@/infra/db/interfaces/notificationRepositoryProtocol";
import { createNotesValidationSchema } from "../validation/notes/createNotesValidationSchema";
import { CreateNotesUseCaseProtocol } from "../interfaces/notes/createNotesUseCaseProtocol";
import { NotesRepositoryProtocol } from "@/infra/db/interfaces/notesRepositoryProtocol";
import { NotificationModel } from "@/domain/models/postgres/NotificationModel";

import { getIo } from "@/lib/socket";
import logger from "@/loaders/logger";

/**
 * Cria uma nova Anotação para um usuário
 */
export class CreateNotesUseCase implements CreateNotesUseCaseProtocol {
  constructor(
    private readonly notesRepository: NotesRepositoryProtocol,
    private readonly routinesRepository: RoutinesRepositoryProtocol,
    private readonly categoryRepository: CategoryRepositoryProtocol,
    private readonly notificationRepository: NotificationRepositoryProtocol
  ) {}

  async handle(data: CreateNotesUseCaseProtocol.Params): Promise<NotesModel> {
    try {
      await createNotesValidationSchema.validate(data, {
        abortEarly: false,
      });

      const existingRoutine = await this.routinesRepository.findByIdAndUserId({
        id: data.routine_id,
        userId: data.userId,
      });

      if (!existingRoutine) {
        throw new BusinessRuleError(
          `Nenhuma rotina encontrada com o ID ${data.routine_id} para este usuário`
        );
      }

      if (data.category_id) {
        const existingCategory =
          await this.categoryRepository.findByIdAndUserId({
            id: data.category_id,
            userId: data.userId,
          });

        if (!existingCategory) {
          throw new BusinessRuleError(
            `Nenhuma categoria encontrada com o ID ${data.category_id} para este usuário`
          );
        }
      }

      const createdNote = await this.notesRepository.create({
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
        userId: data.userId,
        dateOfNote: data.dateOfNote,
      });

      const newNotification = await this.notificationRepository.create({
        title: `Nova anotação criada: ${data.activity}`,
        entity: "Anotação",
        idEntity: createdNote.id,
        userId: data.userId,
        path: `/anotacoes`,
        payload: {
          activity: data.activity,
          activityType: data.activityType,
          priority: data.priority,
          startTime: data.startTime,
          endTime: data.endTime,
          routine_id: data.routine_id,
          category_id: data.category_id,
          routine: existingRoutine,
        } as NotificationModel["payload"],
        typeOfAction: "Criação",
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
          `Notificação de criação de anotação emitida via Socket.IO para userId: ${data.userId} (count: ${countNewNotification})`
        );
      } else {
        logger.warn(
          "Socket.IO não inicializado ou notificação nula → notificação não enviada em tempo real"
        );
      }

      return createdNote;
    } catch (error: any) {
      if (error.name === "ValidationError") {
        throw error;
      }

      if (error instanceof BusinessRuleError) {
        throw error;
      }

      const errorMessage =
        error.message || "Erro interno do servidor durante o cadastro";
      throw new ServerError(`Falha no cadastro de Anotação: ${errorMessage}`);
    }
  }
}
