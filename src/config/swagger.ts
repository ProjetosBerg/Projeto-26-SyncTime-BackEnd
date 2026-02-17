import swaggerJSDoc from "swagger-jsdoc";

export const swaggerOptions: swaggerJSDoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Nome da sua API",
      version: "1.0.0",
      description: "Descrição da sua API",
    },
    servers: [
      {
        url: "http://localhost:3000",
      },
    ],
  },
  apis: ["./src/presentation/routes/*.ts", "./src/docs/swagger/*/*.ts"],
};

export const swaggerSpec = swaggerJSDoc(swaggerOptions);
