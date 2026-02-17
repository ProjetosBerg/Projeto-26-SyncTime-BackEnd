import { GenericExportUseCase } from "@/data/usecases/export/genericExportUseCase";

export const makeGenericExportUseCaseFactory = () => {
  return new GenericExportUseCase();
};
