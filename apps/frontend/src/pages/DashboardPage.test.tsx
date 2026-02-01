/**
 * DashboardPage Tests
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { DashboardPage } from './DashboardPage';
import { AuthContext } from '@/contexts/AuthContext';
import { userService } from '@/services/user.service';

// Mock user service
jest.mock('@/services/user.service', () => ({
  userService: {
    getLoginHistory: jest.fn(),
    updateProfile: jest.fn(),
    uploadAvatar: jest.fn(),
    removeAvatar: jest.fn(),
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

// Mock theme context
jest.mock('@/contexts/ThemeContext', () => ({
  useTheme: () => ({
    theme: 'light',
    setTheme: jest.fn(),
    toggleTheme: jest.fn(),
  }),
}));

const mockUser = {
  id: '1',
  email: 'test@example.com',
  firstName: 'Mario',
  lastName: 'Rossi',
  dateOfBirth: '1990-01-01',
  avatarUrl: null,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

const mockLoginHistory = [
  {
    id: '1',
    userId: '1',
    ipAddress: '192.168.1.1',
    userAgent: 'Mozilla/5.0 Chrome/120.0',
    createdAt: '2024-01-15T10:00:00Z',
  },
  {
    id: '2',
    userId: '1',
    ipAddress: '192.168.1.2',
    userAgent: 'Mozilla/5.0 Firefox/121.0',
    createdAt: '2024-01-14T10:00:00Z',
  },
];

const mockAuthContext = {
  user: mockUser,
  isAuthenticated: true,
  isLoading: false,
  error: null,
  login: jest.fn(),
  register: jest.fn(),
  logout: jest.fn(),
  updateUser: jest.fn(),
  clearError: jest.fn(),
};

const renderDashboardPage = () => {
  return render(
    <BrowserRouter>
      <AuthContext.Provider value={mockAuthContext}>
        <DashboardPage />
      </AuthContext.Provider>
    </BrowserRouter>
  );
};

describe('DashboardPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (userService.getLoginHistory as jest.Mock).mockResolvedValue(mockLoginHistory);
  });

  it('should render dashboard with user info', async () => {
    renderDashboardPage();

    await waitFor(() => {
      expect(screen.getByText(/ciao, mario/i)).toBeInTheDocument();
      expect(screen.getByText(/mario rossi/i)).toBeInTheDocument();
      expect(screen.getByText(mockUser.email)).toBeInTheDocument();
    });
  });

  it('should load and display login history', async () => {
    renderDashboardPage();

    await waitFor(() => {
      expect(userService.getLoginHistory).toHaveBeenCalledWith(5);
      expect(screen.getByText(/192\.168\.1\.1/)).toBeInTheDocument();
      expect(screen.getByText(/192\.168\.1\.2/)).toBeInTheDocument();
    });
  });

  it('should enable edit mode when clicking edit button', async () => {
    const user = userEvent.setup();
    renderDashboardPage();

    await waitFor(() => {
      expect(screen.getByText(/ciao, mario/i)).toBeInTheDocument();
    });

    const editButton = screen.getByRole('button', { name: /modifica/i });
    await user.click(editButton);

    expect(screen.getByRole('button', { name: /salva modifiche/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /annulla/i })).toBeInTheDocument();
  });

  it('should update profile successfully', async () => {
    const updatedUser = { ...mockUser, firstName: 'Giovanni' };
    (userService.updateProfile as jest.Mock).mockResolvedValue(updatedUser);

    const user = userEvent.setup();
    renderDashboardPage();

    await waitFor(() => {
      expect(screen.getByText(/ciao, mario/i)).toBeInTheDocument();
    });

    // Enter edit mode
    const editButton = screen.getByRole('button', { name: /modifica/i });
    await user.click(editButton);

    // Change first name
    const firstNameInput = screen.getByLabelText(/nome/i);
    await user.clear(firstNameInput);
    await user.type(firstNameInput, 'Giovanni');

    // Save changes
    const saveButton = screen.getByRole('button', { name: /salva modifiche/i });
    await user.click(saveButton);

    await waitFor(() => {
      expect(userService.updateProfile).toHaveBeenCalledWith({
        firstName: 'Giovanni',
        lastName: 'Rossi',
        dateOfBirth: '1990-01-01',
      });
      expect(mockAuthContext.updateUser).toHaveBeenCalledWith(updatedUser);
    });
  });

  it('should cancel edit mode', async () => {
    const user = userEvent.setup();
    renderDashboardPage();

    await waitFor(() => {
      expect(screen.getByText(/ciao, mario/i)).toBeInTheDocument();
    });

    // Enter edit mode
    const editButton = screen.getByRole('button', { name: /modifica/i });
    await user.click(editButton);

    // Cancel
    const cancelButton = screen.getByRole('button', { name: /annulla/i });
    await user.click(cancelButton);

    expect(screen.queryByRole('button', { name: /salva modifiche/i })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /modifica/i })).toBeInTheDocument();
  });

  it('should display user initials in avatar', async () => {
    renderDashboardPage();

    await waitFor(() => {
      expect(screen.getByText('MR')).toBeInTheDocument();
    });
  });

  it('should show email as read-only', async () => {
    renderDashboardPage();

    await waitFor(() => {
      expect(screen.getByText(/ciao, mario/i)).toBeInTheDocument();
    });

    // Enter edit mode
    const user = userEvent.setup();
    const editButton = screen.getByRole('button', { name: /modifica/i });
    await user.click(editButton);

    const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement;
    expect(emailInput).toBeDisabled();
  });

  it('should display formatted date of birth', async () => {
    renderDashboardPage();

    await waitFor(() => {
      // Italian date format: 01/01/1990
      expect(screen.getByText(/01\/01\/1990/)).toBeInTheDocument();
    });
  });

  it('should show empty state when no login history', async () => {
    (userService.getLoginHistory as jest.Mock).mockResolvedValue([]);

    renderDashboardPage();

    await waitFor(() => {
      expect(screen.getByText(/nessun accesso registrato/i)).toBeInTheDocument();
    });
  });
});
