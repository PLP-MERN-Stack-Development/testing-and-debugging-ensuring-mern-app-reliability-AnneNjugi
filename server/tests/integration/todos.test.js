const request = require('supertest');
const app = require('../../src/server');
const User = require('../../src/models/User');
const Todo = require('../../src/models/Todo');

describe('Todo Integration Tests', () => {
  let authToken;
  let userId;

  beforeEach(async () => {
    // Register and login a test user
    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Todo Test User',
        email: 'todotest@example.com',
        password: 'password123'
      });

    authToken = registerResponse.body.data.token;
    userId = registerResponse.body.data.user.id;
  });

  describe('POST /api/todos', () => {
    test('should create a new todo with authentication', async () => {
      const todoData = {
        title: 'Test Todo',
        description: 'Test Description',
        priority: 'high'
      };

      const response = await request(app)
        .post('/api/todos')
        .set('Authorization', `Bearer ${authToken}`)
        .send(todoData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe(todoData.title);
      expect(response.body.data.description).toBe(todoData.description);
      expect(response.body.data.priority).toBe(todoData.priority);
      expect(response.body.data.completed).toBe(false);
      expect(response.body.data.userId).toBe(userId);
    });

    test('should not create todo without authentication', async () => {
      const response = await request(app)
        .post('/api/todos')
        .send({ title: 'Test Todo' })
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    test('should require title field', async () => {
      const response = await request(app)
        .post('/api/todos')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ description: 'No title' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('required');
    });

    test('should set default priority to medium', async () => {
      const response = await request(app)
        .post('/api/todos')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Default Priority Todo' })
        .expect(201);

      expect(response.body.data.priority).toBe('medium');
    });

    test('should sanitize input strings', async () => {
      const response = await request(app)
        .post('/api/todos')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: '  <script>alert("xss")</script>Test  ',
          description: '<div>Description</div>'
        })
        .expect(201);

      expect(response.body.data.title).not.toContain('<script>');
      expect(response.body.data.title).not.toContain('</script>');
    });
  });

  describe('GET /api/todos', () => {
    beforeEach(async () => {
      // Create some test todos
      await request(app)
        .post('/api/todos')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Todo 1', priority: 'high', completed: false });

      await request(app)
        .post('/api/todos')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Todo 2', priority: 'low', completed: true });

      await request(app)
        .post('/api/todos')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Todo 3', priority: 'medium', completed: false });
    });

    test('should get all todos for authenticated user', async () => {
      const response = await request(app)
        .get('/api/todos')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(3);
      expect(response.body.count).toBe(3);
    });

    test('should filter todos by completed status', async () => {
      const response = await request(app)
        .get('/api/todos?completed=true')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].completed).toBe(true);
    });

    test('should filter todos by priority', async () => {
      const response = await request(app)
        .get('/api/todos?priority=high')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].priority).toBe('high');
    });

    test('should not get todos without authentication', async () => {
      const response = await request(app)
        .get('/api/todos')
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    test('should only return todos for authenticated user', async () => {
      // Create another user
      const otherUserResponse = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Other User',
          email: 'other@example.com',
          password: 'password123'
        });

      const otherToken = otherUserResponse.body.data.token;

      // Create todo for other user
      await request(app)
        .post('/api/todos')
        .set('Authorization', `Bearer ${otherToken}`)
        .send({ title: 'Other User Todo' });

      // Get todos for first user
      const response = await request(app)
        .get('/api/todos')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Should only get 3 todos (not the other user's todo)
      expect(response.body.data).toHaveLength(3);
      expect(response.body.data.every(todo => todo.userId === userId)).toBe(true);
    });
  });

  describe('GET /api/todos/:id', () => {
    let todoId;

    beforeEach(async () => {
      const response = await request(app)
        .post('/api/todos')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Single Todo' });

      todoId = response.body.data._id;
    });

    test('should get todo by id', async () => {
      const response = await request(app)
        .get(`/api/todos/${todoId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data._id).toBe(todoId);
      expect(response.body.data.title).toBe('Single Todo');
    });

    test('should return 404 for non-existent todo', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await request(app)
        .get(`/api/todos/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('not found');
    });

    test('should not get todo from another user', async () => {
      // Create another user
      const otherUserResponse = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Other User',
          email: 'other2@example.com',
          password: 'password123'
        });

      const otherToken = otherUserResponse.body.data.token;

      // Try to get first user's todo with other user's token
      const response = await request(app)
        .get(`/api/todos/${todoId}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/todos/:id', () => {
    let todoId;

    beforeEach(async () => {
      const response = await request(app)
        .post('/api/todos')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Update Todo', completed: false });

      todoId = response.body.data._id;
    });

    test('should update todo', async () => {
      const updateData = {
        title: 'Updated Title',
        description: 'Updated Description',
        completed: true,
        priority: 'high'
      };

      const response = await request(app)
        .put(`/api/todos/${todoId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe(updateData.title);
      expect(response.body.data.description).toBe(updateData.description);
      expect(response.body.data.completed).toBe(true);
      expect(response.body.data.priority).toBe(updateData.priority);
    });

    test('should update only specified fields', async () => {
      const response = await request(app)
        .put(`/api/todos/${todoId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ completed: true })
        .expect(200);

      expect(response.body.data.completed).toBe(true);
      expect(response.body.data.title).toBe('Update Todo');
    });

    test('should return 404 for non-existent todo', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await request(app)
        .put(`/api/todos/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Updated' })
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    test('should not update todo from another user', async () => {
      // Create another user
      const otherUserResponse = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Other User',
          email: 'other3@example.com',
          password: 'password123'
        });

      const otherToken = otherUserResponse.body.data.token;

      const response = await request(app)
        .put(`/api/todos/${todoId}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .send({ title: 'Hacked' })
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/todos/:id', () => {
    let todoId;

    beforeEach(async () => {
      const response = await request(app)
        .post('/api/todos')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Delete Todo' });

      todoId = response.body.data._id;
    });

    test('should delete todo', async () => {
      const response = await request(app)
        .delete(`/api/todos/${todoId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('deleted');

      // Verify todo is deleted
      const getTodoResponse = await request(app)
        .get(`/api/todos/${todoId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    test('should return 404 for non-existent todo', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await request(app)
        .delete(`/api/todos/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    test('should not delete todo from another user', async () => {
      // Create another user
      const otherUserResponse = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Other User',
          email: 'other4@example.com',
          password: 'password123'
        });

      const otherToken = otherUserResponse.body.data.token;

      const response = await request(app)
        .delete(`/api/todos/${todoId}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);

      // Verify todo still exists for original user
      await request(app)
        .get(`/api/todos/${todoId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
    });
  });
});
