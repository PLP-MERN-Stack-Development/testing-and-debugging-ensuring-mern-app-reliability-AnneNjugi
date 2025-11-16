import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import Register from '../../components/Register';
import * as api from '../../services/api';

jest.mock('../../services/api');

const MockRegister = (props) => (
  <BrowserRouter>
    <Register {...props} />
  </BrowserRouter>
);

describe('Register Integration Tests', () => {
  const mockOnRegister = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders registration form with all fields', () => {
    render(<MockRegister onRegister={mockOnRegister} />);
    
    expect(screen.getByRole('heading', { name: /register/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/^name$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^email$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument();
  });

  test('successfully registers user with valid data', async () => {
    const user = userEvent.setup();
    const mockToken = 'test-token-123';
    api.register.mockResolvedValue({ 
      data: { 
        token: mockToken,
        user: { id: '1', name: 'John Doe', email: 'john@example.com' }
      } 
    });

    render(<MockRegister onRegister={mockOnRegister} />);

    await user.type(screen.getByLabelText(/^name$/i), 'John Doe');
    await user.type(screen.getByLabelText(/^email$/i), 'john@example.com');
    await user.type(screen.getByLabelText(/^password$/i), 'password123');
    await user.type(screen.getByLabelText(/confirm password/i), 'password123');
    
    await user.click(screen.getByRole('button', { name: /register/i }));

    await waitFor(() => {
      expect(api.register).toHaveBeenCalledWith({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123'
      });
      expect(mockOnRegister).toHaveBeenCalledWith(mockToken);
    });
  });

  test('shows error when passwords do not match', async () => {
    const user = userEvent.setup();
    render(<MockRegister onRegister={mockOnRegister} />);

    await user.type(screen.getByLabelText(/^name$/i), 'John Doe');
    await user.type(screen.getByLabelText(/^email$/i), 'john@example.com');
    await user.type(screen.getByLabelText(/^password$/i), 'password123');
    await user.type(screen.getByLabelText(/confirm password/i), 'different');
    
    await user.click(screen.getByRole('button', { name: /register/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/passwords do not match/i);
    });

    expect(api.register).not.toHaveBeenCalled();
    expect(mockOnRegister).not.toHaveBeenCalled();
  });
});
