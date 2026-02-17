import { BusinessRuleError } from "@/data/errors/BusinessRuleError";
import { FieldType } from "@/domain/entities/mongo/CustomFieldsSchema";

/**
 * Valida o valor de um campo customizado baseado no seu tipo.
 * @param type - Tipo do campo (FieldType)
 * @param value - Valor a validar
 * @param fieldLabel - Label do campo para mensagens de erro
 * @param options - Opções para MULTIPLE
 * @throws {BusinessRuleError} Se o valor for inválido para o tipo
 */

export function validateFieldValueByType(
  type: FieldType,
  value: any,
  fieldLabel: string,
  options?: Array<{ value: string }>
): void {
  switch (type) {
    case FieldType.TEXT:
      if (typeof value !== "string" || value.trim() === "") {
        throw new BusinessRuleError(
          `O campo "${fieldLabel}" deve ser uma string válida`
        );
      }
      break;
    case FieldType.NUMBER:
      if (typeof value !== "number" || !isFinite(value) || isNaN(value)) {
        throw new BusinessRuleError(
          `O campo "${fieldLabel}" deve ser um número válido`
        );
      }
      break;
    case FieldType.MULTIPLE:
      if (
        !Array.isArray(value) ||
        value.some((v: any) => typeof v !== "string")
      ) {
        throw new BusinessRuleError(
          `O campo "${fieldLabel}" deve ser um array de strings`
        );
      }
      if (
        options &&
        value.some((v: string) => !options.some((opt) => opt.value === v))
      ) {
        throw new BusinessRuleError(
          `O campo "${fieldLabel}" contém opções inválidas`
        );
      }
      break;
    case FieldType.DATE:
      const date = new Date(value);
      if (isNaN(date.getTime())) {
        throw new BusinessRuleError(
          `O campo "${fieldLabel}" deve ser uma data válida (ex: YYYY-MM-DD)`
        );
      }
      break;
    case FieldType.MONETARY:
      if (
        typeof value !== "number" ||
        !isFinite(value) ||
        isNaN(value) ||
        value < 0
      ) {
        throw new BusinessRuleError(
          `O campo "${fieldLabel}" deve ser um valor monetário positivo`
        );
      }
      // Checa precisão de 2 casas decimais
      if (Math.abs(value * 100 - Math.round(value * 100)) > Number.EPSILON) {
        throw new BusinessRuleError(
          `O campo "${fieldLabel}" deve ter no máximo 2 casas decimais`
        );
      }
      break;
    default:
      throw new BusinessRuleError(
        `Tipo de campo "${type}" não suportado para "${fieldLabel}"`
      );
  }
}
