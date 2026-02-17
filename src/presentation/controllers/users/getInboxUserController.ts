import { Request, Response } from "express";
import { IResponse, ResponseStatus, getError } from "@/utils/service";
import { Controller } from "@/presentation/protocols/controller";
import { GetInboxUserUseCase } from "@/data/usecases/users/getInboxUserUseCase";

export class GetInboxUserController implements Controller {
  constructor(private readonly getInboxUserUseCase: GetInboxUserUseCase) {}

  async handle(
    req: Request,
    res: Response<IResponse>
  ): Promise<Response<IResponse>> {
    try {
      const userId = req.user!.id;

      const inbox = await this.getInboxUserUseCase.handle({ userId });

      return res.status(200).json({
        status: ResponseStatus.OK,
        data: inbox,
        message: "Inbox obtida com sucesso",
      });
    } catch (error) {
      return res.status(500).json({
        status: ResponseStatus.INTERNAL_SERVER_ERROR,
        message: getError(error),
      });
    }
  }
}
