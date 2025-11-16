import { useState, useEffect, useCallback } from 'react';
import { getTodos, createTodo, updateTodo, deleteTodo } from '../services/api';

export const useTodos = () => {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTodos = useCallback(async (filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await getTodos(filters);
      setTodos(response.data.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch todos');
    } finally {
      setLoading(false);
    }
  }, []);

  const addTodo = async (todoData) => {
    try {
      const response = await createTodo(todoData);
      setTodos([response.data.data, ...todos]);
      return response.data.data;
    } catch (err) {
      throw new Error(err.response?.data?.error || 'Failed to create todo');
    }
  };

  const editTodo = async (id, todoData) => {
    try {
      const response = await updateTodo(id, todoData);
      setTodos(todos.map(todo => 
        todo._id === id ? response.data.data : todo
      ));
      return response.data.data;
    } catch (err) {
      throw new Error(err.response?.data?.error || 'Failed to update todo');
    }
  };

  const removeTodo = async (id) => {
    try {
      await deleteTodo(id);
      setTodos(todos.filter(todo => todo._id !== id));
    } catch (err) {
      throw new Error(err.response?.data?.error || 'Failed to delete todo');
    }
  };

  const toggleTodo = async (id) => {
    const todo = todos.find(t => t._id === id);
    if (todo) {
      await editTodo(id, { completed: !todo.completed });
    }
  };

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  return {
    todos,
    loading,
    error,
    fetchTodos,
    addTodo,
    editTodo,
    removeTodo,
    toggleTodo
  };
};
