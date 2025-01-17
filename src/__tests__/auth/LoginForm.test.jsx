import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { UserProvider } from '../../test_common/setupTests';
import LoginForm from '../../auth/LoginForm';
import { describe, test, expect, vi, beforeEach } from 'vitest';

// mock the login function
const mockLogin = vi.fn();

describe('LoginForm component', () => {

    beforeEach(() => {
        mockLogin.mockClear();
    });

    test('renders without crashing', () => {
        render(
            <MemoryRouter>
                <UserProvider login={mockLogin}>
                    <LoginForm />
                </UserProvider>
            </MemoryRouter>
        );

        expect(screen.getByLabelText(/Username/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    });

    test('matches snapshot', () => {
        const { asFragment } = render(
            <MemoryRouter>
                <UserProvider login={mockLogin}>
                    <LoginForm />
                </UserProvider>
            </MemoryRouter>
        );
        expect(asFragment()).toMatchSnapshot();
    });

    test('handles user input correctly', () => {
        render(
            <MemoryRouter>
                <UserProvider login={mockLogin}>
                    <LoginForm />
                </UserProvider>
            </MemoryRouter>
        );
        // enter credentials
        const usernameInput = screen.getByLabelText(/Username/i);
        const passwordInput = screen.getByLabelText(/Password/i);

        fireEvent.change(usernameInput, { target: { value: 'testuser' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });

        expect(usernameInput.value).toBe('testuser');
        expect(passwordInput.value).toBe('password123');
    });

    test('calls login func when submitted', async () => {
        mockLogin.mockResolvedValue(); // simulate success

        render(
            <MemoryRouter>
                <UserProvider login={mockLogin}>
                    <LoginForm />
                </UserProvider>
            </MemoryRouter>
        );
        // enter credentials and click login
        const usernameInput = screen.getByLabelText(/Username/i);
        const passwordInput = screen.getByLabelText(/Password/i);
        const loginBtn = screen.getByRole('button', { name: /Log In/i });

        fireEvent.change(usernameInput, { target: { value: 'testuser' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });
        fireEvent.click(loginBtn);

        await waitFor(() => {
            expect(mockLogin).toHaveBeenCalledWith({
                username: 'testuser',
                password: 'password123',
            });
        });
    });

    test('displays error message for invalid credentials', async () => {
        // simulate failure with error msg
        mockLogin.mockRejectedValue(new Error('Invalid username or password'));

        render(
            <MemoryRouter>
                <UserProvider login={mockLogin}>
                    <LoginForm />
                </UserProvider>
            </MemoryRouter>
        );

        const usernameInput = screen.getByLabelText(/Username/i);
        const passwordInput = screen.getByLabelText(/Password/i);
        const loginBtn = screen.getByRole('button', { name: /Log In/i });

        fireEvent.change(usernameInput, { target: { value: 'wronguser' } });
        fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
        fireEvent.click(loginBtn);

        // expect proper error
        const errorMsg = await screen.findByText(/Invalid username or password/i);
        expect(errorMsg).toBeInTheDocument();
        expect(errorMsg).toHaveClass('form-error');
    });
});
