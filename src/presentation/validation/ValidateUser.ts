import { ResponseStatus } from "@/utils/service";
import { Request, Response } from "express";
/**
 * Verifica se o usuário autenticado tem autorização para acessar/modificar o recurso
 * @param req - Request object com user autenticado
 * @param res - Response object
 * @param resourceUserId - ID do usuário que está tentando acessar/modificar o recurso
 * @returns boolean - true se autorizado, false caso contrário (já envia a response)
 */
export const checkUserAuthorization = async (
  req: Request,
  res: Response,
  resourceUserId: string
): Promise<boolean> => {
  if (String(resourceUserId) !== String(req.user!.id)) {
    return false;
  }
  return true;
};
