import * as yup from "yup";
import {
  RecurrenceConfig,
  recurrenceFrequencies,
} from "@/domain/models/postgres/NotesModel";
import { parseDateOnly } from "../../notes/helpers/generateRecurrenceDates";

const MAX_RECURRENCE_HORIZON_DAYS = 730;

const recurrenceSchema = yup
  .object()
  .shape({
    frequency: yup
      .string()
      .oneOf([...recurrenceFrequencies], "Frequência de recorrência inválida")
      .required("Frequência de recorrência é obrigatória"),
    interval: yup
      .number()
      .integer("Intervalo da recorrência deve ser inteiro")
      .min(1, "Intervalo da recorrência deve ser no mínimo 1")
      .max(30, "Intervalo da recorrência deve ser no máximo 30")
      .default(1),
    endDate: yup
      .string()
      .required("Data final da recorrência é obrigatória")
      .test(
        "valid-end-date",
        "Data final da recorrência deve estar no formato YYYY-MM-DD",
        (value) => Boolean(value && parseDateOnly(value))
      ),
    weekDays: yup
      .array()
      .of(
        yup
          .number()
          .integer("Dia da semana deve ser inteiro")
          .min(0, "Dia da semana deve estar entre 0 e 6")
          .max(6, "Dia da semana deve estar entre 0 e 6")
      )
      .max(7, "Selecione no máximo sete dias da semana")
      .test(
        "unique-week-days",
        "Não é permitido repetir dias da semana",
        (weekDays) => !weekDays || new Set(weekDays).size === weekDays.length
      ),
  })
  .default(undefined);

export const createNotesValidationSchema = yup
  .object()
  .shape({
    status: yup
      .string()
      .required("Status é obrigatório")
      .max(50, "Status deve ter no máximo 50 caracteres"),
    collaborators: yup
      .array()
      .of(yup.string())
      .max(10, "Máximo de 10 colaboradores")
      .nullable(),
    priority: yup
      .string()
      .required("Prioridade é obrigatória")
      .max(50, "Prioridade deve ter no máximo 50 caracteres"),
    category_id: yup
      .string()
      .uuid("ID da categoria deve ser um UUID válido")
      .nullable(),
    activity: yup
      .string()
      .required("Atividade é obrigatória")
      .max(255, "Atividade deve ter no máximo 255 caracteres"),
    activityType: yup
      .string()
      .required("Tipo de atividade é obrigatório")
      .max(100, "Tipo de atividade deve ter no máximo 100 caracteres"),
    description: yup
      .string()
      .required("Descrição é obrigatória")
      .min(10, "Descrição deve ter no mínimo 10 caracteres"),
    startTime: yup
      .string()
      .required("Hora de início é obrigatória")
      .matches(
        /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
        "Formato de hora inválido (HH:MM)"
      ),
    endTime: yup
      .string()
      .required("Hora de fim é obrigatória")
      .matches(
        /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
        "Formato de hora inválido (HH:MM)"
      ),
    comments: yup
      .array()
      .of(
        yup.object().shape({
          author: yup.string().required(),
          text: yup.string().required(),
          created_at: yup.date().required(),
          updated_at: yup.date().required(),
        })
      )
      .max(20, "Máximo de 20 comentários iniciais")
      .nullable(),
    routine_id: yup
      .string()
      .required("ID da rotina é obrigatório")
      .uuid("ID da rotina deve ser um UUID válido"),
    userId: yup.string().required("ID do Usuário é obrigatório"),
    dateOfNote: yup.date().typeError("Data da anotação é inválida").nullable(),
    recurrence: recurrenceSchema.nullable(),
    reminderMinutesBefore: yup
      .number()
      .integer("Antecedência do lembrete deve ser um número inteiro")
      .min(0, "Antecedência do lembrete não pode ser negativa")
      .max(10080, "Lembrete deve ter no máximo sete dias de antecedência")
      .nullable()
      .optional(),
    timezoneOffset: yup
      .number()
      .integer("Fuso horário inválido")
      .min(-840, "Fuso horário inválido")
      .max(840, "Fuso horário inválido")
      .when("reminderMinutesBefore", {
        is: (value: number | null | undefined) => value != null,
        then: yup.number().required("Fuso horário é obrigatório para o lembrete"),
      }),
  })
  .test(
    "recurrence-period",
    "Período de recorrência inválido",
    function (data) {
      if (!data?.recurrence) return true;
      const recurrence = data.recurrence as RecurrenceConfig;

      const startDate = data.dateOfNote
        ? parseDateOnly(data.dateOfNote as Date)
        : null;
      const endDate = parseDateOnly(recurrence.endDate);

      if (!startDate) {
        return this.createError({
          path: "dateOfNote",
          message: "Data da anotação é obrigatória para recorrência",
        });
      }

      if (!endDate || endDate < startDate) {
        return this.createError({
          path: "recurrence.endDate",
          message:
            "Data final da recorrência deve ser igual ou posterior à data inicial",
        });
      }

      const horizonDays =
        (endDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000);

      if (horizonDays > MAX_RECURRENCE_HORIZON_DAYS) {
        return this.createError({
          path: "recurrence.endDate",
          message: "Recorrência não pode ultrapassar dois anos",
        });
      }

      return true;
    }
  )
  .test(
    "weekly-days-only",
    "Dias da semana só podem ser usados na recorrência semanal",
    (data) => {
      const recurrence = data?.recurrence as RecurrenceConfig | undefined;
      return !recurrence?.weekDays?.length || recurrence.frequency === "weekly";
    }
  );
