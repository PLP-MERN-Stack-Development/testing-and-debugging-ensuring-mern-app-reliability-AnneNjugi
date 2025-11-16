import { renderHook, act, waitFor } from '@testing-library/react';
import { useTodos } from '../../hooks/useTodos';
import * as api from '../../services/api';

// Mock the API
jest.mock('../../services/api');

describe('useTodos Hook', () => {
  const mockTodos = [
    { _id: '1', title: 'Todo 1', completed: false, priority: 'high' },
    { _id: '2', title: 'Todo 2', completed: true, priority: 'low' }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('fetches todos on mount', async () => {
    api.getTodos.mockResolvedValue({ data: { data: mockTodos } });
    
    const { result } = renderHook(() => useTodos());
    
    expect(result.current.loading).toBe(true);
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    expect(result.current.todos).toEqual(mockTodos);
    expect(api.getTodos).toHaveBeenCalledTimes(1);
  });

  test('handles fetch error', async () => {
    const errorMessage = 'Failed to fetch';
    api.getTodos.mockRejectedValue({
      response: { data: { error: errorMessage } }
    });
    
    const { result } = renderHook(() => useTodos());
    
    await waitFor(() => {
      expect(result.current.error).toBe(errorMessage);
    });
    
    expect(result.current.loading).toBe(false);
  });

  test('adds a new todo', async () => {
    api.getTodos.mockResolvedValue({ data: { data: mockTodos } });
    const newTodo = { _id: '3', title: 'New Todo', completed: false };
    api.createTodo.mockResolvedValue({ data: { data: newTodo } });
    
    const { result } = renderHook(() => useTodos());
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    await act(async () => {
      await result.current.addTodo({ title: 'New Todo' });
    });
    
    expect(result.current.todos).toHaveLength(3);
    expect(result.current.todos[0]).toEqual(newTodo);
  });

  test('updates a todo', async () => {
    api.getTodos.mockResolvedValue({ data: { data: mockTodos } });
    const updatedTodo = { ...mockTodos[0], title: 'Updated Todo' };
    api.updateTodo.mockResolvedValue({ data: { data: updatedTodo } });
    
    const { result } = renderHook(() => useTodos());
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    await act(async () => {
      await result.current.editTodo('1', { title: 'Updated Todo' });
    });
    
    expect(result.current.todos[0].title).toBe('Updated Todo');
  });

  test('deletes a todo', async () => {
    api.getTodos.mockResolvedValue({ data: { data: mockTodos } });
    api.deleteTodo.mockResolvedValue({});
    
    const { result } = renderHook(() => useTodos());
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    await act(async () => {
      await result.current.removeTodo('1');
    });
    
    expect(result.current.todos).toHaveLength(1);
    expect(result.current.todos[0]._id).toBe('2');
  });

  test('toggles todo completion', async () => {
    api.getTodos.mockResolvedValue({ data: { data: mockTodos } });
    const toggledTodo = { ...mockTodos[0], completed: true };
    api.updateTodo.mockResolvedValue({ data: { data: toggledTodo } });
    
    const { result } = renderHook(() => useTodos());
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    await act(async () => {
      await result.current.toggleTodo('1');
    });
    
    expect(result.current.todos[0].completed).toBe(true);
  });

  test('handles add todo error', async () => {
    api.getTodos.mockResolvedValue({ data: { data: [] } });
    api.createTodo.mockRejectedValue({
      response: { data: { error: 'Failed to create' } }
    });
    
    const { result } = renderHook(() => useTodos());
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    await expect(
      act(async () => {
        await result.current.addTodo({ title: 'Test' });
      })
    ).rejects.toThrow('Failed to create');
  });
});
