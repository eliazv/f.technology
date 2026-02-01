/**
 * RegisterPage Tests
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { RegisterPage } from './RegisterPage';
import { AuthProvider } from '@/contexts/AuthContext';
import { authService } from '@/services/auth.service';

// Mock auth service
jest.mock('@/services/auth.service', () => ({
  authService: {
    register: jest.fn(),
    getCurrentUser: jest.fn(),
  },
}));

// Mock toast
jest.mock('@/components/ui/Toast', () => ({
  useToast: () => ({
    toast: {
      success: jest.fn(),
      error: jest.fn(),
    },
  }),
}));

// Mock navigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

const mockAuthResponse = {
  user: {
    id: '1',
    email: 'test@example.com',
    firstName: 'Mario',
    lastName: 'Rossi',
    dateOfBirth: '1990-01-01',
    avatarUrl: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  accessToken: 'mock-token',
  expiresIn: 604800000,
};

const renderRegisterPage = () => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <RegisterPage />
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('RegisterPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render registration form', () => {
    renderRegisterPage();

    expect(screen.getByLabelText(/nome/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/cognome/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/conferma password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/data di nascita/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /registrati/i })).toBeInTheDocument();
  });

  it('should show validation errors for empty fields', async () => {
    const user = userEvent.setup();
    renderRegisterPage();

    const submitButton = screen.getByRole('button', { name: /registrati/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/nome deve contenere almeno 2 caratteri/i)).toBeInTheDocument();
      expect(screen.getByText(/cognome deve contenere almeno 2 caratteri/i)).toBeInTheDocument();
      expect(screen.getByText(/email è obbligatoria/i)).toBeInTheDocument();
    });
  });

  it('should validate password requirements', async () => {
    const user = userEvent.setup();
    renderRegisterPage();

    const passwordInput = screen.getByLabelText(/^password$/i);
    await user.type(passwordInput, 'weak');

    const submitButton = screen.getByRole('button', { name: /registrati/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText(/password deve contenere almeno 8 caratteri/i)
      ).toBeInTheDocument();
    });
  });

  it('should validate password with uppercase and number', async () => {
    const user = userEvent.setup();
    renderRegisterPage();

    const passwordInput = screen.getByLabelText(/^password$/i);
    await user.type(passwordInput, 'weakpassword');

    const submitButton = screen.getByRole('button', { name: /registrati/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText(/password deve contenere almeno una lettera maiuscola e un numero/i)
      ).toBeInTheDocument();
    });
  });

  it('should validate password confirmation match', async () => {
    const user = userEvent.setup();
    renderRegisterPage();

    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmPasswordInput = screen.getByLabelText(/conferma password/i);

    await user.type(passwordInput, 'Password123');
    await user.type(confirmPasswordInput, 'Password456');

    const submitButton = screen.getByRole('button', { name: /registrati/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/password non corrispondono/i)).toBeInTheDocument();
    });
  });

  it('should validate age (minimum 13 years)', async () => {
    const user = userEvent.setup();
    renderRegisterPage();

    const today = new Date();
    const tooYoung = new Date(today.getFullYear() - 10, today.getMonth(), today.getDate());
    const dateString = tooYoung.toISOString().split('T')[0];

    const dateInput = screen.getByLabelText(/data di nascita/i);
    await user.type(dateInput, dateString);

    const submitButton = screen.getByRole('button', { name: /registrati/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/devi avere almeno 13 anni/i)).toBeInTheDocument();
    });
  });

  it('should register successfully with valid data', async () => {
    (authService.register as jest.Mock).mockResolvedValue(mockAuthResponse);

    const user = userEvent.setup();
    renderRegisterPage();

    await user.type(screen.getByLabelText(/nome/i), 'Mario');
    await user.type(screen.getByLabelText(/cognome/i), 'Rossi');
    await user.type(screen.getByLabelText(/email/i), 'mario@example.com');
    await user.type(screen.getByLabelText(/^password$/i), 'Password123');
    await user.type(screen.getByLabelText(/conferma password/i), 'Password123');
    await user.type(screen.getByLabelText(/data di nascita/i), '1990-01-01');

    const submitButton = screen.getByRole('button', { name: /registrati/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(authService.register).toHaveBeenCalledWith({
        firstName: 'Mario',
        lastName: 'Rossi',
        email: 'mario@example.com',
        password: 'Password123',
        confirmPassword: 'Password123',
        dateOfBirth: '1990-01-01',
      });
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });

  it('should show link to login page', () => {
    renderRegisterPage();

    const loginLink = screen.getByText(/accedi/i);
    expect(loginLink).toBeInTheDocument();
    expect(loginLink.closest('a')).toHaveAttribute('href', '/login');
  });

  it('should show avatar upload button', () => {
    renderRegisterPage();

    const uploadButton = screen.getByRole('button', { name: /carica avatar/i });
    expect(uploadButton).toBeInTheDocument();
  });

  it('should toggle password visibility', async () => {
    const user = userEvent.setup();
    renderRegisterPage();

    const passwordInput = screen.getByLabelText(/^password$/i) as HTMLInputElement;
    expect(passwordInput.type).toBe('password');

    // Find the first toggle button (for password field)
    const toggleButtons = screen.getAllByRole('button', { name: '' });
    await user.click(toggleButtons[0]);

    expect(passwordInput.type).toBe('text');
  });
});
