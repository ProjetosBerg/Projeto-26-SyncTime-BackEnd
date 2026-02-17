import { UserModel } from "@/domain/models/postgres/UserModel";
import { SecurityQuestionModel } from "@/domain/models/postgres/SecurityQuestionModel";
import { faker } from "@faker-js/faker";

const mockUser: UserModel = {
  id: faker.string.uuid(),
  name: "berg",
  login: "bergkley",
  email: "berg@example.com",
  password: faker.internet.password(),
  security_questions: [
    {
      id: faker.string.uuid(),
      question: "Qual é o nome do seu primeiro animal de estimação?",
      answer: "Rex",
    },
    {
      id: faker.string.uuid(),
      question: "Qual é a cidade onde você nasceu?",
      answer: "São Paulo",
    },
  ],
};

export { mockUser };
