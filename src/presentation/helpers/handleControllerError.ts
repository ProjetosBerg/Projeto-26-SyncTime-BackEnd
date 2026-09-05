import { Response } from "express";
import { ValidationError } from "yup";
import { BaseError } from "@/data/errors/baseError";
import logger from "@/loaders/logger";
import {
  getError,
  getResponseStatus,
  IResponse,
  ResponseStatus,
} from "@/utils/service";

export const handleControllerError = (
  res: Response<IResponse>,
  error: unknown
): Response<IResponse> => {
  if (error instanceof BaseError) {
    const statusCode = error.getStatusCode();
    if (statusCode >= 500) {
      logger.error(getError(error));
      return res.status(statusCode).json({
        status: ResponseStatus.INTERNAL_SERVER_ERROR,
        message: "Erro interno do servidor",
        errors: ["Erro interno do servidor"],
      });
    }

    return res.status(statusCode).json({
      status: getResponseStatus(statusCode),
      errors: [error.message],
    });
  }

  if (error instanceof ValidationError) {
    return res.status(400).json({
      status: ResponseStatus.BAD_REQUEST,
      errors: error.errors,
    });
  }

  logger.error(getError(error));
  return res.status(500).json({
    status: ResponseStatus.INTERNAL_SERVER_ERROR,
    message: "Erro interno do servidor",
    errors: ["Erro interno do servidor"],
  });
};
