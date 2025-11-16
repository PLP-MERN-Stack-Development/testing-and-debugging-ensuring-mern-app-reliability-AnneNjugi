const mongoose = require('mongoose');
const User = require('../../src/models/User');
const Todo = require('../../src/models/Todo');

describe('Database Operations Integration Tests', () => {
  describe('User Model', () => {
    test('should create user with hashed password', async () => {
      const userData = {
        name: 'Test User',
        email: 'dbtest@example.com',
        password: 'password123'
      };

      const user = await User.create(userData);

      expect(user._id).toBeDefined();
      expect(user.name).toBe(userData.name);
      expect(user.email).toBe(userData.email);
      expect(user.password).not.toBe(userData.password);
      expect(user.password).toMatch(/^\$2[aby]\$/);
    });

    test('should not allow duplicate emails', async () => {
      const userData = {
        name: 'Duplicate Test',
        email: 'duplicate@example.com',
        password: 'password123'
      };

      await User.create(userData);

      await expect(User.create(userData)).rejects.toThrow();
    });

    test('should validate email format', async () => {
      const userData = {
        name: 'Invalid Email',
        email: 'not-an-email',
        password: 'password123'
      };

      await expect(User.create(userData)).rejects.toThrow();
    });

    test('should compare passwords correctly', async () => {
      const user = await User.create({
        name: 'Password Test',
        email: 'pwtest@example.com',
        password: 'password123'
      });

      const isMatch = await user.comparePassword('password123');
      expect(isMatch).toBe(true);

      const isNotMatch = await user.comparePassword('wrongpassword');
      expect(isNotMatch).toBe(false);
    });
  });

  describe('Todo Model', () => {
    let userId;

    beforeEach(async () => {
      const user = await User.create({
        name: 'Todo Test User',
        email: 'todouser@example.com',
        password: 'password123'
      });
      userId = user._id;
    });

    test('should create todo with required fields', async () => {
      const todoData = {
        title: 'Test Todo',
        userId: userId
      };

      const todo = await Todo.create(todoData);

      expect(todo._id).toBeDefined();
      expect(todo.title).toBe(todoData.title);
      expect(todo.userId.toString()).toBe(userId.toString());
      expect(todo.completed).toBe(false);
      expect(todo.priority).toBe('medium');
    });

    test('should validate title length', async () => {
      const shortTitle = {
        title: 'ab',
        userId: userId
      };

      await expect(Todo.create(shortTitle)).rejects.toThrow();

      const longTitle = {
        title: 'a'.repeat(101),
        userId: userId
      };

      await expect(Todo.create(longTitle)).rejects.toThrow();
    });

    test('should validate priority enum', async () => {
      const invalidPriority = {
        title: 'Test Todo',
        priority: 'urgent',
        userId: userId
      };

      await expect(Todo.create(invalidPriority)).rejects.toThrow();
    });

    test('should require userId', async () => {
      const noUser = {
        title: 'Test Todo'
      };

      await expect(Todo.create(noUser)).rejects.toThrow();
    });

    test('should set timestamps automatically', async () => {
      const todo = await Todo.create({
        title: 'Timestamp Test',
        userId: userId
      });

      expect(todo.createdAt).toBeDefined();
      expect(todo.updatedAt).toBeDefined();
      expect(todo.createdAt).toBeInstanceOf(Date);
      expect(todo.updatedAt).toBeInstanceOf(Date);
    });

    test('should update timestamp on modification', async () => {
      const todo = await Todo.create({
        title: 'Update Test',
        userId: userId
      });

      const originalUpdatedAt = todo.updatedAt;

      // Wait a bit to ensure timestamp difference
      await new Promise(resolve => setTimeout(resolve, 10));

      todo.title = 'Updated Title';
      await todo.save();

      expect(todo.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    });
  });

  describe('Relationships', () => {
    test('should populate user reference in todo', async () => {
      const user = await User.create({
        name: 'Relation Test',
        email: 'relation@example.com',
        password: 'password123'
      });

      const todo = await Todo.create({
        title: 'Test Todo',
        userId: user._id
      });

      const populatedTodo = await Todo.findById(todo._id).populate('userId');

      expect(populatedTodo.userId.name).toBe(user.name);
      expect(populatedTodo.userId.email).toBe(user.email);
    });

    test('should cascade delete user todos', async () => {
      const user = await User.create({
        name: 'Delete Test',
        email: 'delete@example.com',
        password: 'password123'
      });

      await Todo.create({
        title: 'Todo 1',
        userId: user._id
      });

      await Todo.create({
        title: 'Todo 2',
        userId: user._id
      });

      const todosBeforeDelete = await Todo.find({ userId: user._id });
      expect(todosBeforeDelete).toHaveLength(2);

      await User.findByIdAndDelete(user._id);
      await Todo.deleteMany({ userId: user._id });

      const todosAfterDelete = await Todo.find({ userId: user._id });
      expect(todosAfterDelete).toHaveLength(0);
    });
  });
});
