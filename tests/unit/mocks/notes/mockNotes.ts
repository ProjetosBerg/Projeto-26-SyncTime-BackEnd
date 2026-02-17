import { NotesModel, Comment } from "@/domain/models/postgres/NotesModel";

export const mockComment: Comment = {
  author: "user-123",
  text: "Comentário inicial",
  created_at: new Date(),
  updated_at: new Date(),
};

export const mockNotes: NotesModel = {
  id: "123e4567-e89b-12d3-a456-426614174000",
  status: "Pendente",
  collaborators: ["user-123", "user-456"],
  priority: "Alta",
  category_id: "987fcdeb-51a2-43d5-b789-0123456789ab",
  activity: "Reunião importante",
  activityType: "Virtual",
  description:
    "Descrição detalhada da Anotação com mais de 10 caracteres para passar na validação.",
  startTime: "09:00",
  endTime: "10:00",
  comments: [mockComment],
  routine_id: "123e4567-e89b-12d3-a456-426614174001",
  user_id: "user-123",
  created_at: new Date(),
  updated_at: new Date(),
};
