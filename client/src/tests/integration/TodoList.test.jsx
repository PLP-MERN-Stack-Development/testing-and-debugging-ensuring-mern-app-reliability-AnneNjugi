import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TodoList from '../../components/TodoList';
import * as api from '../../services/api';

jest.mock('../../services/api');

describe('TodoList Integration Tests', () => {
  const mockTodos = [
    {
      _id: '1',
      title: 'Buy groceries',
      description: 'Milk, eggs, bread',
      completed: false,
      priority: 'high'
    },
    {
      _id: '2',
      title: 'Finish project',
      description: 'Complete testing',
      completed: true,
      priority: 'medium'
    },
    {
      _id: '3',
      title: 'Call dentist',
      description: '',
      completed: false,
      priority: 'low'
    }
  ];

  const mockOnLogout = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    api.getTodos.mockResolvedValue({ data: { data: mockTodos } });
  });

  test('fetches and displays todos on mount', async () => {
    render(<TodoList onLogout={mockOnLogout} />);

    expect(screen.getByText(/loading todos/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Buy groceries')).toBeInTheDocument();
      expect(screen.getByText('Finish project')).toBeInTheDocument();
      expect(screen.getByText('Call dentist')).toBeInTheDocument();
    });

    expect(api.getTodos).toHaveBeenCalledTimes(1);
  });

  test('displays error message when fetch fails', async () => {
    const errorMessage = 'Failed to fetch todos';
    api.getTodos.mockRejectedValue({
      response: { data: { error: errorMessage } }
    });

    render(<TodoList onLogout={mockOnLogout} />);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(errorMessage);
    });
  });

  test('adds new todo through form', async () => {
    const user = userEvent.setup();
    const newTodo = {
      _id: '4',
      title: 'New Task',
      description: 'New Description',
      completed: false,
      priority: 'medium'
    };

    api.createTodo.mockResolvedValue({ data: { data: newTodo } });

    render(<TodoList onLogout={mockOnLogout} />);

    await waitFor(() => {
      expect(screen.getByText('Buy groceries')).toBeInTheDocument();
    });

    const titleInput = screen.getByPlaceholderText(/what needs to be done/i);
    await user.type(titleInput, 'New Task');
    
    const submitButton = screen.getByRole('button', { name: /add todo/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(api.createTodo).toHaveBeenCalledWith({
        title: 'New Task',
        description: '',
        priority: 'medium'
      });
    });
  });

  test('filters todos by status', async () => {
    const user = userEvent.setup();
    render(<TodoList onLogout={mockOnLogout} />);

    await waitFor(() => {
      expect(screen.getByText('Buy groceries')).toBeInTheDocument();
    });

    // Click "Completed" filter
    const completedButton = screen.getByRole('button', { name: /^completed$/i });
    await user.click(completedButton);

    // Should only show completed todo
    expect(screen.getByText('Finish project')).toBeInTheDocument();
    expect(screen.queryByText('Buy groceries')).not.toBeInTheDocument();
    expect(screen.queryByText('Call dentist')).not.toBeInTheDocument();
  });

  test('filters todos by active status', async () => {
    const user = userEvent.setup();
    render(<TodoList onLogout={mockOnLogout} />);

    await waitFor(() => {
      expect(screen.getByText('Buy groceries')).toBeInTheDocument();
    });

    // Click "Active" filter
    const activeButton = screen.getByRole('button', { name: /^active$/i });
    await user.click(activeButton);

    // Should only show active todos
    expect(screen.getByText('Buy groceries')).toBeInTheDocument();
    expect(screen.getByText('Call dentist')).toBeInTheDocument();
    expect(screen.queryByText('Finish project')).not.toBeInTheDocument();
  });

  test('shows all todos when "All" filter is selected', async () => {
    const user = userEvent.setup();
    render(<TodoList onLogout={mockOnLogout} />);

    await waitFor(() => {
      expect(screen.getByText('Buy groceries')).toBeInTheDocument();
    });

    // Click "Active" first
    const activeButton = screen.getByRole('button', { name: /^active$/i });
    await user.click(activeButton);

    // Then click "All"
    const allButton = screen.getByRole('button', { name: /^all$/i });
    await user.click(allButton);

    // Should show all todos
    expect(screen.getByText('Buy groceries')).toBeInTheDocument();
    expect(screen.getByText('Finish project')).toBeInTheDocument();
    expect(screen.getByText('Call dentist')).toBeInTheDocument();
  });

  test('toggles todo completion', async () => {
    const user = userEvent.setup();
    const updatedTodo = { ...mockTodos[0], completed: true };
    api.updateTodo.mockResolvedValue({ data: { data: updatedTodo } });

    render(<TodoList onLogout={mockOnLogout} />);

    await waitFor(() => {
      expect(screen.getByText('Buy groceries')).toBeInTheDocument();
    });

    const checkboxes = screen.getAllByRole('checkbox');
    await user.click(checkboxes[0]);

    await waitFor(() => {
      expect(api.updateTodo).toHaveBeenCalledWith('1', { completed: true });
    });
  });

  test('deletes todo', async () => {
    const user = userEvent.setup();
    window.confirm = jest.fn(() => true);
    api.deleteTodo.mockResolvedValue({});

    render(<TodoList onLogout={mockOnLogout} />);

    await waitFor(() => {
      expect(screen.getByText('Buy groceries')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByRole('button', { name: /delete todo/i });
    await user.click(deleteButtons[0]);

    await waitFor(() => {
      expect(api.deleteTodo).toHaveBeenCalledWith('1');
    });
  });

  test('updates todo', async () => {
    const user = userEvent.setup();
    const updatedTodo = { ...mockTodos[0], title: 'Updated Title' };
    api.updateTodo.mockResolvedValue({ data: { data: updatedTodo } });

    render(<TodoList onLogout={mockOnLogout} />);

    await waitFor(() => {
      expect(screen.getByText('Buy groceries')).toBeInTheDocument();
    });

    const editButtons = screen.getAllByRole('button', { name: /edit todo/i });
    await user.click(editButtons[0]);

    const titleInput = screen.getByDisplayValue('Buy groceries');
    await user.clear(titleInput);
    await user.type(titleInput, 'Updated Title');

    const saveButton = screen.getByRole('button', { name: /save/i });
    await user.click(saveButton);

    await waitFor(() => {
      expect(api.updateTodo).toHaveBeenCalledWith('1', {
        title: 'Updated Title',
        description: 'Milk, eggs, bread'
      });
    });
  });

  test('calls onLogout when logout button is clicked', async () => {
    const user = userEvent.setup();
    render(<TodoList onLogout={mockOnLogout} />);

    await waitFor(() => {
      expect(screen.getByText('Buy groceries')).toBeInTheDocument();
    });

    const logoutButton = screen.getByRole('button', { name: /logout/i });
    await user.click(logoutButton);

    expect(mockOnLogout).toHaveBeenCalledTimes(1);
  });

  test('displays message when no todos match filter', async () => {
    const user = userEvent.setup();
    api.getTodos.mockResolvedValue({ data: { data: [] } });

    render(<TodoList onLogout={mockOnLogout} />);

    await waitFor(() => {
      expect(screen.getByText(/no todos found/i)).toBeInTheDocument();
    });
  });

  test('handles API errors when adding todo', async () => {
    const user = userEvent.setup();
    window.alert = jest.fn();
    api.createTodo.mockRejectedValue({
      response: { data: { error: 'Failed to create' } }
    });

    render(<TodoList onLogout={mockOnLogout} />);

    await waitFor(() => {
      expect(screen.getByText('Buy groceries')).toBeInTheDocument();
    });

    const titleInput = screen.getByPlaceholderText(/what needs to be done/i);
    await user.type(titleInput, 'New Task');
    
    const submitButton = screen.getByRole('button', { name: /add todo/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Failed to create');
    });
  });
});
