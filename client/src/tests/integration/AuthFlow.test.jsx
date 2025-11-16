import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../../App';
import * as api from '../../services/api';

jest.mock('../../services/api');

describe('Authentication Flow Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    api.getTodos.mockResolvedValue({ data: { data: [] } });
  });

  test('redirects to login when not authenticated', () => {
    render(<App />);
    
    expect(window.location.pathname).toBe('/');
  });

  test('complete registration and login flow', async () => {
    const user = userEvent.setup();
    const mockToken = 'test-token-123';
    
    api.register.mockResolvedValue({
      data: {
        token: mockToken,
        user: { id: '1', name: 'Test User', email: 'test@example.com' }
      }
    });

    render(<App />);

    // Navigate to register
    const registerLink = screen.getByRole('link', { name: /register/i });
    await user.click(registerLink);

    // Fill registration form
    await user.type(screen.getByLabelText(/^name$/i), 'Test User');
    await user.type(screen.getByLabelText(/^email$/i), 'test@example.com');
    await user.type(screen.getByLabelText(/^password$/i), 'password123');
    await user.type(screen.getByLabelText(/confirm password/i), 'password123');
    
    await user.click(screen.getByRole('button', { name: /register/i }));

    // Should redirect to todos page
    await waitFor(() => {
      expect(screen.getByText(/my todos/i)).toBeInTheDocument();
    });

    expect(localStorage.getItem('token')).toBe(mockToken);
  });

  test('logout clears token and redirects to login', async () => {
    const user = userEvent.setup();
    localStorage.setItem('token', 'test-token');
    
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/my todos/i)).toBeInTheDocument();
    });

    const logoutButton = screen.getByRole('button', { name: /logout/i });
    await user.click(logoutButton);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /login/i })).toBeInTheDocument();
    });

    expect(localStorage.getItem('token')).toBeNull();
  });
});
