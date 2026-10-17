import { Period } from "./RoutinModel";
import { RecurrenceFrequency } from "./NotesModel";

export type MyDayItemModel = {
  id: string;
  activity?: string;
  activityType?: string;
  description?: string;
  status?: string;
  priority?: string;
  collaborators?: string[];
  startTime?: string;
  endTime?: string;
  dateOfNote?: Date;
  recurrenceGroupId?: string;
  recurrenceFrequency?: RecurrenceFrequency;
  recurrenceInterval?: number;
  recurrenceEndDate?: string;
  recurrenceWeekDays?: number[];
  routine: {
    id: string;
    type: string;
    period?: Period;
  };
  category: {
    id: string;
    name: string;
  } | null;
};

export type MyDaySummaryModel = {
  total: number;
  completed: number;
  inProgress: number;
  pending: number;
  completionPercentage: number;
};

export type MyDayModel = {
  date: string;
  items: MyDayItemModel[];
  summary: MyDaySummaryModel;
};
