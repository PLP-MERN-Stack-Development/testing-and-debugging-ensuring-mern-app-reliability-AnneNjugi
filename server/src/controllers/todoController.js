const Todo = require('../models/Todo');
const { sanitizeString } = require('../utils/validators');

/**
 * Get all todos for authenticated user
 */
const getTodos = async (req, res) => {
  try {
    const { completed, priority, sort } = req.query;
    
    // Build query
    const query = { userId: req.userId };
    if (completed !== undefined) {
      query.completed = completed === 'true';
    }
    if (priority) {
      query.priority = priority;
    }

    // Build sort
    let sortOption = { createdAt: -1 };
    if (sort === 'dueDate') {
      sortOption = { dueDate: 1 };
    } else if (sort === 'priority') {
      sortOption = { priority: -1 };
    }

    const todos = await Todo.find(query).sort(sortOption);

    res.json({
      success: true,
      count: todos.length,
      data: todos
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Get single todo by ID
 */
const getTodoById = async (req, res) => {
  try {
    const todo = await Todo.findOne({
      _id: req.params.id,
      userId: req.userId
    });

    if (!todo) {
      return res.status(404).json({
        success: false,
        error: 'Todo not found'
      });
    }

    res.json({
      success: true,
      data: todo
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Create new todo
 */
const createTodo = async (req, res) => {
  try {
    const { title, description, priority, dueDate } = req.body;

    // Validate required fields
    if (!title) {
      return res.status(400).json({
        success: false,
        error: 'Title is required'
      });
    }

    // Sanitize inputs
    const sanitizedTitle = sanitizeString(title);
    const sanitizedDescription = description ? sanitizeString(description) : '';

    const todo = await Todo.create({
      title: sanitizedTitle,
      description: sanitizedDescription,
      priority: priority || 'medium',
      dueDate: dueDate || null,
      userId: req.userId
    });

    res.status(201).json({
      success: true,
      data: todo
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Update todo
 */
const updateTodo = async (req, res) => {
  try {
    const { title, description, completed, priority, dueDate } = req.body;

    const todo = await Todo.findOne({
      _id: req.params.id,
      userId: req.userId
    });

    if (!todo) {
      return res.status(404).json({
        success: false,
        error: 'Todo not found'
      });
    }

    // Update fields
    if (title !== undefined) todo.title = sanitizeString(title);
    if (description !== undefined) todo.description = sanitizeString(description);
    if (completed !== undefined) todo.completed = completed;
    if (priority !== undefined) todo.priority = priority;
    if (dueDate !== undefined) todo.dueDate = dueDate;

    await todo.save();

    res.json({
      success: true,
      data: todo
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Delete todo
 */
const deleteTodo = async (req, res) => {
  try {
    const todo = await Todo.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId
    });

    if (!todo) {
      return res.status(404).json({
        success: false,
        error: 'Todo not found'
      });
    }

    res.json({
      success: true,
      message: 'Todo deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

module.exports = {
  getTodos,
  getTodoById,
  createTodo,
  updateTodo,
  deleteTodo
};
