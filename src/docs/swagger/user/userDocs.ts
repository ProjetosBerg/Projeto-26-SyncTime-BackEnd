export const userDocs = () => {
  return `
    /**
     * @openapi
     * /api/user/find-user/{id}:
     *   get:
     *     summary: Buscar usuário por ID
     *     tags: [Users]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *         description: ID do usuário
     *     responses:
     *       200:
     *         description: Usuário encontrado
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 id:
     *                   type: string
     *                 login:
     *                   type: string
     *                 name:
     *                   type: string
     *                 email:
     *                   type: string
     *       401:
     *         description: Não autorizado
     *       404:
     *         description: Usuário não encontrado
     *
     * /api/user/find-questions:
     *   get:
     *     summary: Buscar perguntas de segurança de um usuário
     *     tags: [Users]
     *     parameters:
     *       - in: query
     *         name: login
     *         required: true
     *         schema:
     *           type: string
     *           minLength: 2
     *           maxLength: 50
     *           pattern: ^[a-z0-9._-]+$
     *         description: Login do usuário (apenas letras minúsculas, números, ponto, sublinhado ou traço)
     *     responses:
     *       200:
     *         description: Perguntas de segurança recuperadas com sucesso
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 type: object
     *                 properties:
     *                   id:
     *                     type: string
     *                   question:
     *                     type: string
     *       400:
     *         description: Dados de entrada inválidos
     *       401:
     *         description: Não autorizado
     *       404:
     *         description: Usuário não encontrado
     *
     * /api/user/register:
     *   post:
     *     summary: Registrar um novo usuário
     *     tags: [Users]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - name
     *               - login
     *               - email
     *               - password
     *               - confirmpassword
     *               - securityQuestions
     *             properties:
     *               name:
     *                 type: string
     *                 minLength: 2
     *                 maxLength: 50
     *                 example: teste teste
     *                 description: Nome do usuário (mínimo 2 caracteres, máximo 50 caracteres)
     *               login:
     *                 type: string
     *                 minLength: 2
     *                 maxLength: 50
     *                 pattern: ^[a-z0-9._-]+$
     *                 example: teste
     *                 description: Login do usuário (apenas letras minúsculas, números, ponto, sublinhado ou traço)
     *               email:
     *                 type: string
     *                 format: email
     *                 example: user@example.com
     *                 description: E-mail do usuário (deve estar em minúsculas)
     *               password:
     *                 type: string
     *                 minLength: 6
     *                 maxLength: 100
     *                 example: securePassword123
     *                 description: Senha do usuário (mínimo 6 caracteres, máximo 100 caracteres)
     *               confirmpassword:
     *                 type: string
     *                 minLength: 6
     *                 maxLength: 100
     *                 example: securePassword123
     *                 description: Confirmação da senha (deve corresponder à senha)
     *               securityQuestions:
     *                 type: array
     *                 minItems: 1
     *                 items:
     *                   type: object
     *                   required:
     *                     - question
     *                     - answer
     *                   properties:
     *                     question:
     *                       type: string
     *                       example: Qual é o nome do seu primeiro animal de estimação?
     *                       description: Pergunta de segurança
     *                     answer:
     *                       type: string
     *                       example: Rex
     *                       description: Resposta à pergunta de segurança
     *                 description: Lista de perguntas de segurança (mínimo 1)
     *     responses:
     *       201:
     *         description: Usuário registrado com sucesso
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 id:
     *                   type: string
     *                 login:
     *                   type: string
     *                 name:
     *                   type: string
     *                 email:
     *                   type: string
     *
     * /api/user/login:
     *   post:
     *     summary: Autenticar um usuário
     *     tags: [Users]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - login
     *               - password
     *             properties:
     *               login:
     *                 type: string
     *                 minLength: 2
     *                 maxLength: 50
     *                 pattern: ^[a-z0-9._-]+$
     *                 example: teste
     *                 description: Login do usuário (apenas letras minúsculas, números, ponto, sublinhado ou traço)
     *               password:
     *                 type: string
     *                 minLength: 6
     *                 maxLength: 100
     *                 example: securePassword123
     *                 description: Senha do usuário
     *     responses:
     *       200:
     *         description: Usuário autenticado com sucesso
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 token:
     *                   type: string
     *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
     *                 user:
     *                   type: object
     *                   properties:
     *                     id:
     *                       type: string
     *                     login:
     *                       type: string
     *                     name:
     *                       type: string
     *                     email:
     *                       type: string
     *       401:
     *         description: Credenciais inválidas
     *
     * /api/user/forgot-password:
     *   patch:
     *     summary: Solicitar redefinição de senha
     *     tags: [Users]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - login
     *               - newPassword
     *               - confirmNewPassword
     *               - securityQuestions
     *             properties:
     *               login:
     *                 type: string
     *                 minLength: 2
     *                 maxLength: 50
     *                 pattern: ^[a-z0-9._-]+$
     *                 example: teste
     *                 description: Login do usuário (apenas letras minúsculas, números, ponto, sublinhado ou traço)
     *               newPassword:
     *                 type: string
     *                 minLength: 6
     *                 maxLength: 100
     *                 example: newPassword123
     *                 description: Nova senha do usuário
     *               confirmNewPassword:
     *                 type: string
     *                 minLength: 6
     *                 maxLength: 100
     *                 example: newPassword123
     *                 description: Confirmação da nova senha (deve corresponder à nova senha)
     *               securityQuestions:
     *                 type: array
     *                 minItems: 1
     *                 items:
     *                   type: object
     *                   required:
     *                     - question
     *                     - answer
     *                   properties:
     *                     question:
     *                       type: string
     *                       example: Qual é o nome do seu primeiro animal de estimação?
     *                       description: Pergunta de segurança
     *                     answer:
     *                       type: string
     *                       example: Rex
     *                       description: Resposta à pergunta de segurança
     *                 description: Lista de perguntas de segurança (mínimo 1)
     *     responses:
     *       200:
     *         description: Solicitação de redefinição de senha enviada
     *       400:
     *         description: Dados de entrada inválidos
     *       404:
     *         description: Usuário não encontrado
     *
     * /api/user/edit/{id}:
     *   patch:
     *     summary: Editar usuário por ID
     *     tags: [Users]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *         description: ID do usuário
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               name:
     *                 type: string
     *                 minLength: 2
     *                 maxLength: 50
     *                 example: new user
     *                 description: Nome do usuário (mínimo 2 caracteres, máximo 50 caracteres)
     *               email:
     *                 type: string
     *                 format: email
     *                 example: user@example.com
     *                 description: E-mail do usuário (deve estar em minúsculas)
     *               security_questions:
     *                 type: array
     *                 minItems: 1
     *                 items:
     *                   type: object
     *                   required:
     *                     - question
     *                     - answer
     *                   properties:
     *                     question:
     *                       type: string
     *                       example: Qual é o nome do seu primeiro animal de estimação?
     *                       description: Pergunta de segurança
     *                     answer:
     *                       type: string
     *                       example: Rex
     *                       description: Resposta à pergunta de segurança
     *                 description: Lista de perguntas de segurança (mínimo 1)
     *     responses:
     *       200:
     *         description: Usuário atualizado com sucesso
     *       400:
     *         description: Dados de entrada inválidos
     *       401:
     *         description: Não autorizado
     *       404:
     *         description: Usuário não encontrado
      * /api/user/delete/{id}:
     *   delete:
     *     summary: Deletar usuário por ID
     *     tags: [Users]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *         description: ID do usuário
     *     responses:
     *       200:
     *         description: Usuário deletado com sucesso
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: Usuário deletado com sucesso
     *       401:
     *         description: Não autorizado
     *       404:
     *         description: Usuário não encontrado
     *       500:
     *         description: Erro interno do servidor
     */
  `;
};

export const securitySchemes = () => {
  return `
    /**
     * @openapi
     * components:
     *   securitySchemes:
     *     bearerAuth:
     *       type: http
     *       scheme: bearer
     *       bearerFormat: JWT
     */
  `;
};
