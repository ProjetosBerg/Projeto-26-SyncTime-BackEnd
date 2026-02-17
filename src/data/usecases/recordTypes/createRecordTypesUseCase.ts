import { ServerError } from "@/data/errors/ServerError";
import { BusinessRuleError } from "@/data/errors/BusinessRuleError";
import { CreateRecordTypeUseCaseProtocol } from "@/data/usecases/interfaces/recordTypes/createRecordTypeUseCaseProtocol";
import { RecordTypesRepositoryProtocol } from "@/infra/db/interfaces/recordTypesRepositoryProtocol";
import { RecordTypeModel } from "@/domain/models/postgres/RecordTypesModel";
import { createRecordTypeValidationSchema } from "@/data/usecases/validation/recordTypes/createRecordTypeValidationSchema";

/**
 * Cria um novo tipo de registro para um usuário específico
 * @param {CreateRecordTypeUseCaseProtocol.Params} data - Os dados do tipo de registro a ser criado
 * @param {string} data.userId - O ID do usuário proprietário do tipo de registro
 * @param {string} data.name - O nome do tipo de registro
 * @param {string} data.icone - O ícone do tipo de registro
 * @returns {Promise<RecordTypeModel>} O tipo de registro criado
 * @throws {ValidationError} Se os dados fornecidos não passarem na validação
 * @throws {BusinessRuleError} Se já existir um tipo de registro com o mesmo nome para o usuário
 * @throws {ServerError} Se ocorrer um erro inesperado durante a criação
 */
export class CreateRecordTypeUseCase
  implements CreateRecordTypeUseCaseProtocol
{
  constructor(
    private readonly recordTypeRepository: RecordTypesRepositoryProtocol
  ) {}

  async handle(
    data: CreateRecordTypeUseCaseProtocol.Params
  ): Promise<RecordTypeModel> {
    try {
      await createRecordTypeValidationSchema.validate(data, {
        abortEarly: false,
      });

      const existingRecordType =
        await this.recordTypeRepository.findByNameAndUserId({
          name: data?.name,
          userId: data?.userId,
        });
      if (existingRecordType) {
        throw new BusinessRuleError(
          `Já existe um tipo de registro com o nome "${data?.name}" para este usuário`
        );
      }

      const recordType = {
        userId: data?.userId,
        name: data?.name,
        icone: data?.icone,
      };

      return await this.recordTypeRepository.create(recordType);
    } catch (error: any) {
      if (error.name === "ValidationError") {
        throw error;
      }

      if (error instanceof BusinessRuleError) {
        throw error;
      }

      const errorMessage =
        error.message || "Erro interno do servidor durante o cadastro";
      throw new ServerError(
        `Falha no cadastro do record type: ${errorMessage}`
      );
    }
  }
}
