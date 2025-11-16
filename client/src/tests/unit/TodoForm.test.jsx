import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TodoForm from '../../components/TodoForm';

describe('TodoForm Component', () => {
  test('renders form with all inputs', () => {
    render(<TodoForm onSubmit={jest.fn()} />);
    
    expect(screen.getByPlaceholderText(/what needs to be done/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/description/i)).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add todo/i })).toBeInTheDocument();
  });

  test('updates input values on change', async () => {
    const user = userEvent.setup();
    render(<TodoForm onSubmit={jest.fn()} />);
    
    const titleInput = screen.getByPlaceholderText(/what needs to be done/i);
    const descInput = screen.getByPlaceholderText(/description/i);
    
    await user.type(titleInput, 'Test Todo');
    await user.type(descInput, 'Test Description');
    
    expect(titleInput).toHaveValue('Test Todo');
    expect(descInput).toHaveValue('Test Description');
  });

  test('calls onSubmit with form data when submitted', async () => {
    const user = userEvent.setup();
    const mockSubmit = jest.fn();
    render(<TodoForm onSubmit={mockSubmit} />);
    
    const titleInput = screen.getByPlaceholderText(/what needs to be done/i);
    const submitButton = screen.getByRole('button', { name: /add todo/i });
    
    await user.type(titleInput, 'New Todo');
    await user.click(submitButton);
    
    expect(mockSubmit).toHaveBeenCalledWith({
      title: 'New Todo',
      description: '',
      priority: 'medium'
    });
  });

  test('clears form after submission', async () => {
    const user = userEvent.setup();
    render(<TodoForm onSubmit={jest.fn()} />);
    
    const titleInput = screen.getByPlaceholderText(/what needs to be done/i);
    const submitButton = screen.getByRole('button', { name: /add todo/i });
    
    await user.type(titleInput, 'Test Todo');
    await user.click(submitButton);
    
    expect(titleInput).toHaveValue('');
  });

  test('does not submit with empty title', async () => {
    const user = userEvent.setup();
    const mockSubmit = jest.fn();
    render(<TodoForm onSubmit={mockSubmit} />);
    
    const submitButton = screen.getByRole('button', { name: /add todo/i });
    await user.click(submitButton);
    
    expect(mockSubmit).not.toHaveBeenCalled();
  });

  test('allows selecting priority', async () => {
    const user = userEvent.setup();
    const mockSubmit = jest.fn();
    render(<TodoForm onSubmit={mockSubmit} />);
    
    const titleInput = screen.getByPlaceholderText(/what needs to be done/i);
    const prioritySelect = screen.getByRole('combobox');
    const submitButton = screen.getByRole('button', { name: /add todo/i });
    
    await user.type(titleInput, 'High Priority Task');
    await user.selectOptions(prioritySelect, 'high');
    await user.click(submitButton);
    
    expect(mockSubmit).toHaveBeenCalledWith({
      title: 'High Priority Task',
      description: '',
      priority: 'high'
    });
  });
});
