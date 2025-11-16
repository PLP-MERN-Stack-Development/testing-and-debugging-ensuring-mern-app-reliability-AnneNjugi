import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TodoItem from '../../components/TodoItem';

describe('TodoItem Component', () => {
  const mockTodo = {
    _id: '1',
    title: 'Test Todo',
    description: 'Test Description',
    completed: false,
    priority: 'medium'
  };

  const mockHandlers = {
    onToggle: jest.fn(),
    onUpdate: jest.fn(),
    onDelete: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders todo item with title and description', () => {
    render(<TodoItem todo={mockTodo} {...mockHandlers} />);
    
    expect(screen.getByText('Test Todo')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
  });

  test('displays priority badge', () => {
    render(<TodoItem todo={mockTodo} {...mockHandlers} />);
    
    expect(screen.getByText('medium')).toBeInTheDocument();
  });

  test('calls onToggle when checkbox is clicked', async () => {
    const user = userEvent.setup();
    render(<TodoItem todo={mockTodo} {...mockHandlers} />);
    
    const checkbox = screen.getByRole('checkbox');
    await user.click(checkbox);
    
    expect(mockHandlers.onToggle).toHaveBeenCalledWith('1');
  });

  test('shows completed styling when todo is completed', () => {
    const completedTodo = { ...mockTodo, completed: true };
    const { container } = render(<TodoItem todo={completedTodo} {...mockHandlers} />);
    
    expect(container.querySelector('.todo-item')).toHaveClass('completed');
  });

  test('enters edit mode when edit button is clicked', async () => {
    const user = userEvent.setup();
    render(<TodoItem todo={mockTodo} {...mockHandlers} />);
    
    const editButton = screen.getByRole('button', { name: /edit todo/i });
    await user.click(editButton);
    
    expect(screen.getByDisplayValue('Test Todo')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });

  test('calls onUpdate when save is clicked in edit mode', async () => {
    const user = userEvent.setup();
    mockHandlers.onUpdate.mockResolvedValue({});
    render(<TodoItem todo={mockTodo} {...mockHandlers} />);
    
    const editButton = screen.getByRole('button', { name: /edit todo/i });
    await user.click(editButton);
    
    const titleInput = screen.getByDisplayValue('Test Todo');
    await user.clear(titleInput);
    await user.type(titleInput, 'Updated Todo');
    
    const saveButton = screen.getByRole('button', { name: /save/i });
    await user.click(saveButton);
    
    expect(mockHandlers.onUpdate).toHaveBeenCalledWith('1', {
      title: 'Updated Todo',
      description: 'Test Description'
    });
  });

  test('cancels edit mode without saving', async () => {
    const user = userEvent.setup();
    render(<TodoItem todo={mockTodo} {...mockHandlers} />);
    
    const editButton = screen.getByRole('button', { name: /edit todo/i });
    await user.click(editButton);
    
    const titleInput = screen.getByDisplayValue('Test Todo');
    await user.clear(titleInput);
    await user.type(titleInput, 'Changed');
    
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);
    
    expect(screen.getByText('Test Todo')).toBeInTheDocument();
    expect(mockHandlers.onUpdate).not.toHaveBeenCalled();
  });

  test('calls onDelete when delete button is clicked and confirmed', async () => {
    const user = userEvent.setup();
    window.confirm = jest.fn(() => true);
    mockHandlers.onDelete.mockResolvedValue({});
    
    render(<TodoItem todo={mockTodo} {...mockHandlers} />);
    
    const deleteButton = screen.getByRole('button', { name: /delete todo/i });
    await user.click(deleteButton);
    
    expect(window.confirm).toHaveBeenCalled();
    expect(mockHandlers.onDelete).toHaveBeenCalledWith('1');
  });

  test('does not delete when confirmation is cancelled', async () => {
    const user = userEvent.setup();
    window.confirm = jest.fn(() => false);
    
    render(<TodoItem todo={mockTodo} {...mockHandlers} />);
    
    const deleteButton = screen.getByRole('button', { name: /delete todo/i });
    await user.click(deleteButton);
    
    expect(mockHandlers.onDelete).not.toHaveBeenCalled();
  });
});
