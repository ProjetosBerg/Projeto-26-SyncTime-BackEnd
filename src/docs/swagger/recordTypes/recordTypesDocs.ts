export const recordTypesDocs = () => {
  return `
    /**
     * @openapi
     * /api/record-types/userId:
     *   get:
     *     summary: Buscar todos os tipos de registros de um usuário
     *     tags: [RecordTypes]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: query
     *         name: userId
     *         required: true
     *         schema:
     *           type: string
     *         description: ID do usuário cujos tipos de registros serão recuperados
     *     responses:
     *       200:
     *         description: Lista de tipos de registros recuperada com sucesso
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 type: object
     *                 properties:
     *                   id:
     *                     type: integer
     *                     description: ID do tipo de registro
     *                     example: 1
     *                   user_id:
     *                     type: object
     *                     properties:
     *                       id:
     *                         type: string
     *                         description: ID do usuário
     *                         example: user-123
     *                   name:
     *                     type: string
     *                     description: Nome do tipo de registro
     *                     example: Compras
     *                   icone:
     *                     type: string
     *                     description: Ícone do tipo de registro
     *                     example: shopping-cart
     *                   created_at:
     *                     type: string
     *                     format: date-time
     *                     description: Data de criação do tipo de registro
     *                     example: 2025-07-05T10:00:00Z
     *                   updated_at:
     *                     type: string
     *                     format: date-time
     *                     description: Data de última atualização do tipo de registro
     *                     example: 2025-07-05T10:00:00Z
     *       400:
     *         description: Dados de entrada inválidos
     *       401:
     *         description: Não autorizado
     *       404:
     *         description: Nenhum tipo de registro encontrado para o usuário
     *       500:
     *         description: Erro interno do servidor
     *
     * /api/record-types/{id}:
     *   get:
     *     summary: Buscar um tipo de registro por ID
     *     tags: [RecordTypes]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: integer
     *         description: ID do tipo de registro
     *       - in: query
     *         name: userId
     *         required: true
     *         schema:
     *           type: string
     *         description: ID do usuário proprietário do tipo de registro
     *     responses:
     *       200:
     *         description: Tipo de registro encontrado
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 id:
     *                   type: integer
     *                   description: ID do tipo de registro
     *                   example: 1
     *                 user_id:
     *                   type: object
     *                   properties:
     *                     id:
     *                       type: string
     *                       description: ID do usuário
     *                       example: user-123
     *                 name:
     *                   type: string
     *                   description: Nome do tipo de registro
     *                   example: Compras
     *                 icone:
     *                   type: string
     *                   description: Ícone do tipo de registro
     *                   example: shopping-cart
     *                 created_at:
     *                   type: string
     *                   format: date-time
     *                   description: Data de criação do tipo de registro
     *                   example: 2025-07-05T10:00:00Z
     *                 updated_at:
     *                   type: string
     *                   format: date-time
     *                   description: Data de última atualização do tipo de registro
     *                   example: 2025-07-05T10:00:00Z
     *       400:
     *         description: Dados de entrada inválidos
     *       401:
     *         description: Não autorizado
     *       404:
     *         description: Tipo de registro não encontrado
     *       500:
     *         description: Erro interno do servidor
     *
     * /api/record-types/create:
     *   post:
     *     summary: Criar um novo tipo de registro
     *     tags: [RecordTypes]
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - user_id
     *               - name
     *               - icone
     *             properties:
     *               user_id:
     *                 type: string
     *                 description: ID do usuário proprietário do tipo de registro
     *                 example: user-123
     *               name:
     *                 type: string
     *                 minLength: 2
     *                 maxLength: 50
     *                 description: Nome do tipo de registro
     *                 example: Compras
     *               icone:
     *                 type: string
     *                 maxLength: 100
     *                 description: Ícone do tipo de registro
     *                 example: shopping-cart
     *     responses:
     *       201:
     *         description: Tipo de registro criado com sucesso
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 id:
     *                   type: integer
     *                   description: ID do tipo de registro
     *                   example: 1
     *                 user_id:
     *                   type: object
     *                   properties:
     *                     id:
     *                       type: string
     *                       description: ID do usuário
     *                       example: user-123
     *                 name:
     *                   type: string
     *                   description: Nome do tipo de registro
     *                   example: Compras
     *                 icone:
     *                   type: string
     *                   description: Ícone do tipo de registro
     *                   example: shopping-cart
     *                 created_at:
     *                   type: string
     *                   format: date-time
     *                   description: Data de criação do tipo de registro
     *                   example: 2025-07-05T10:00:00Z
     *                 updated_at:
     *                   type: string
     *                   format: date-time
     *                   description: Data de última atualização do tipo de registro
     *                   example: 2025-07-05T10:00:00Z
     *       400:
     *         description: Dados de entrada inválidos
     *       401:
     *         description: Não autorizado
     *       409:
     *         description: Já existe um tipo de registro com o mesmo nome para o usuário
     *       500:
     *         description: Erro interno do servidor
     *
     * /api/record-types/edit/{id}:
     *   patch:
     *     summary: Editar um tipo de registro por ID
     *     tags: [RecordTypes]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: integer
     *         description: ID do tipo de registro
     *     requestBody:
     *       required: false
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - user_id
     *               - name
     *               - icone
     *             properties:
     *               user_id:
     *                 type: string
     *                 description: ID do usuário proprietário do tipo de registro
     *                 example: user-123
     *               name:
     *                 type: string
     *                 minLength: 2
     *                 maxLength: 50
     *                 description: Novo nome do tipo de registro
     *                 example: Compras Atualizadas
     *               icone:
     *                 type: string
     *                 maxLength: 100
     *                 description: Novo ícone do tipo de registro
     *                 example: updated-cart
     *     responses:
     *       200:
     *         description: Tipo de registro atualizado com sucesso
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 id:
     *                   type: integer
     *                   description: ID do tipo de registro
     *                   example: 1
     *                 user_id:
     *                   type: object
     *                   properties:
     *                     id:
     *                       type: string
     *                       description: ID do usuário
     *                       example: user-123
     *                 name:
     *                   type: string
     *                   description: Nome do tipo de registro
     *                   example: Compras Atualizadas
     *                 icone:
     *                   type: string
     *                   description: Ícone do tipo de registro
     *                   example: updated-cart
     *                 created_at:
     *                   type: string
     *                   format: date-time
     *                   description: Data de criação do tipo de registro
     *                   example: 2025-07-05T10:00:00Z
     *                 updated_at:
     *                   type: string
     *                   format: date-time
     *                   description: Data de última atualização do tipo de registro
     *                   example: 2025-07-06T17:24:00Z
     *       400:
     *         description: Dados de entrada inválidos
     *       401:
     *         description: Não autorizado
     *       404:
     *         description: Tipo de registro não encontrado
     *       409:
     *         description: Já existe um tipo de registro com o mesmo nome para o usuário
     *       500:
     *         description: Erro interno do servidor
     *
     * /api/record-types/delete/{id}:
     *   delete:
     *     summary: Deletar um tipo de registro por ID
     *     tags: [RecordTypes]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: integer
     *         description: ID do tipo de registro
     *       - in: query
     *         name: userId
     *         required: true
     *         schema:
     *           type: string
     *         description: ID do usuário proprietário do tipo de registro
     *     responses:
     *       200:
     *         description: Tipo de registro deletado com sucesso
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: Tipo de registro deletado com sucesso
     *       400:
     *         description: Dados de entrada inválidos
     *       401:
     *         description: Não autorizado
     *       404:
     *         description: Tipo de registro não encontrado
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
