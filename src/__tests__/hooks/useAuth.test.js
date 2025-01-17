import { act } from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import useAuth from '../../hooks/useAuth';
import Api from '../../helpers/api';
import { toast } from 'react-toastify';
import { describe, expect, test, vi, beforeEach } from 'vitest';

// mock api.js funcs
vi.mock('../../helpers/api', () => ({
    default: {
        setToken: vi.fn(),
        clearToken: vi.fn(),
        getCurrentUser: vi.fn(),
        login: vi.fn(),
        register: vi.fn(),
        setupInterceptor: vi.fn(),
        isTokenExpired: vi.fn()
    }
}));

// mock toast
vi.mock('react-toastify', () => ({
    toast: {
        error: vi.fn()
    }
}));

// clear mocks + localstorage before each test
beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();

    // mock behavior of Api.token to update the mock token
    Api.setToken.mockImplementation((token) => {
        Api.token = token; // mimic setting token in api
    })

    // mock isTokenExpired to always return false before each test (default)
    Api.isTokenExpired.mockImplementation(() => false);
});

describe('useAuth hook', () => {
    test('initializes with no user or token', async () => {
        const { result } = renderHook(() => useAuth()); // render the hook

        // once loading completes...
        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        })

        // ..verify that no curr user or token is set
        expect(result.current.currUser).toBeNull();
        expect(result.current.token).toBeNull();
    });

    test('fetches user data when token exists', async () => {
        localStorage.setItem('token', 'mock-token') // set mock token
        // mock api response for getCurrentUser
        Api.getCurrentUser.mockResolvedValue({ username: 'testuser' });

        const { result } = renderHook(() => useAuth()); // render the hook

        // wait for user data to be fetched
        await waitFor(() => {
            expect(Api.setToken).toHaveBeenCalledWith('mock-token');
            expect(Api.getCurrentUser).toHaveBeenCalled();
            expect(result.current.currUser).toEqual({ username: 'testuser' });
            expect(result.current.loading).toBe(false);
        });
    })

    test('handles token expiration', async () => {
        localStorage.setItem('token', 'expired-token') // mock expired token
        Api.isTokenExpired.mockReturnValue(true); // mock to return true

        const { result } = renderHook(() => useAuth()); // render the hook

        // wait for token expiration handling
        await waitFor(() => {
            expect(Api.clearToken).toHaveBeenCalled(); // ensure token was cleared
            expect(toast.error).toHaveBeenCalledWith(
                'Your session has expired. Please log in again.',
                expect.anything()
            )
            expect(result.current.currUser).toBeNull();
            expect(result.current.token).toBeNull();
        })
    })

    test('logs in a user and updates state', async () => {
        Api.login.mockResolvedValue('mock-token') // mock api response for login
        Api.getCurrentUser.mockResolvedValue({ username: 'testuser' }); // mock user data

        const { result } = renderHook(() => useAuth());

        // trigger login
        await act(async () => {
            await result.current.login({
                username: 'testuser',
                password: 'password123'
            });
        })

        // verify that state was updated
        await waitFor(() => {
            expect(result.current.token).toBe('mock-token');
            expect(result.current.currUser).toEqual({ username: 'testuser' });
        })

        // very that api calls were made
        expect(Api.login).toHaveBeenCalledWith({
            username: 'testuser',
            password: 'password123'
        })
        expect(Api.getCurrentUser).toHaveBeenCalled();
    })

    test('logs out a user and clears state', async () => {
        localStorage.setItem('token', 'mock-token');

        const { result } = renderHook(() => useAuth());

        // trigger logout
        act(() => {
            result.current.logout();
        })

        // wait for state and localstorage to clear
        await waitFor(() => {
            expect(result.current.currUser).toBeNull();
            expect(result.current.token).toBeNull();
            expect(localStorage.getItem('token')).toBeNull();
            expect(Api.clearToken).toHaveBeenCalled();
        })

    });

    test('signs up a user and updates state', async () => {
        Api.register.mockResolvedValue('mock-token'); // mock api response for register
        Api.getCurrentUser.mockResolvedValue({ username: 'newuser' });

        const { result } = renderHook(() => useAuth());

        // trigger signup
        await act(async () => {
            await result.current.signup({
                username: 'newuser',
                password: 'newpassword'
            })
        })

        // verify that state was updated
        await waitFor(() => {
            expect(result.current.currUser).toEqual({ username: 'newuser' })
            expect(result.current.token).toBe('mock-token')
        })

        // verify that api calls were made
        expect(Api.register).toHaveBeenCalledWith({ username: 'newuser', password: 'newpassword' });
        expect(Api.getCurrentUser).toHaveBeenCalled();
    });
})