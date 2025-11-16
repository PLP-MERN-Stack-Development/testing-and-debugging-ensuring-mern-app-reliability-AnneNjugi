import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import Login from '../../components/Login';
import * as api from '../../services/api';

jest.mock('../../services/api');

const MockLogin = (props) => (
  <BrowserRouter>
    <Login {...props} />
  </BrowserRouter>
);

describe('Login Component', () => {
  const mockOnLogin = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders login form', () => {
    render(<MockLogin onLogin={mockOnLogin} />);
    
    expect(screen.getByRole('heading', { name: /login/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  test('updates form fields on input', async () => {
    const user = userEvent.setup();
    render(<MockLogin onLogin={mockOnLogin} />);
    
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    
    expect(emailInput).toHaveValue('test@example.com');
    expect(passwordInput).toHaveValue('password123');
  });

  test('submits form with credentials', async () => {
    const user = userEvent.setup();
    const mockToken = 'test-token-123';
    api.login.mockResolvedValue({ data: { token: mockToken } });
    
    render(<MockLogin onLogin={mockOnLogin} />);
    
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /login/i }));
    
    await waitFor(() => {
      expect(api.login).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      });
      expect(mockOnLogin).toHaveBeenCalledWith(mockToken);
    });
  });

  test('displays error message on login failure', async () => {
    const user = userEvent.setup();
    const errorMessage = 'Invalid credentials';
    api.login.mockRejectedValue({
      response: { data: { error: errorMessage } }
    });
    
    render(<MockLogin onLogin={mockOnLogin} />);
    
    await user.type(screen.getByLabelText(/email/i), 'wrong@example.com');
    await user.type(screen.getByLabelText(/password/i), 'wrongpass');
    await user.click(screen.getByRole('button', { name: /login/i }));
    
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(errorMessage);
    });
    
    expect(mockOnLogin).not.toHaveBeenCalled();
  });

  test('disables form during submission', async () => {
    const user = userEvent.setup();
    api.login.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
    
    render(<MockLogin onLogin={mockOnLogin} />);
    
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    
    const submitButton = screen.getByRole('button', { name: /login/i });
    await user.click(submitButton);
    
    expect(submitButton).toBeDisabled();
    expect(screen.getByLabelText(/email/i)).toBeDisabled();
    expect(screen.getByLabelText(/password/i)).toBeDisabled();
  });

  test('shows link to register page', () => {
    render(<MockLogin onLogin={mockOnLogin} />);
    
    expect(screen.getByText(/don't have an account/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /register/i })).toHaveAttribute('href', '/register');
  });
});
