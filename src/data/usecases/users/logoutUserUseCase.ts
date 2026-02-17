import { ServerError } from "@/data/errors/ServerError";
import { NotFoundError } from "@/data/errors/NotFoundError";
import { AuthenticationRepositoryProtocol } from "@/infra/db/interfaces/authenticationRepositoryProtocol";
import { LogoutUserUseCaseProtocol } from "../interfaces/users/logoutUserUseCaseProtocol";

export class LogoutUserUseCase implements LogoutUserUseCaseProtocol {
  constructor(
    private readonly authenticationRepository: AuthenticationRepositoryProtocol
  ) {}

  /**
   * Finaliza uma sessão de autenticação, marcando a data de logout para monitoramento de presença
   * @param {LogoutUserUseCaseProtocol.Params} data - Dados do logout
   * @param {string} data.sessionId - ID único da sessão (obtido do token ou request)
   * @returns {Promise<LogoutUserUseCaseProtocol.Result>} Confirmação do logout
   * @throws {NotFoundError} Se a sessão não for encontrada
   * @throws {ServerError} Se ocorrer um erro inesperado
   */
  async handle(
    data: LogoutUserUseCaseProtocol.Params
  ): Promise<LogoutUserUseCaseProtocol.Result> {
    try {
      const updatedAuth = await this.authenticationRepository.updateLogout({
        sessionId: data.sessionId,
      });

      if (!updatedAuth) {
        throw new NotFoundError("Sessão de autenticação não encontrada");
      }

      return {
        message: "Logout realizado com sucesso",
        sessionId: data.sessionId,
      };
    } catch (error: any) {
      if (error instanceof NotFoundError) {
        throw error;
      }

      const errorMessage =
        error.message || "Erro interno do servidor durante o logout";
      throw new ServerError(`Falha no logout do usuário: ${errorMessage}`);
    }
  }
}
