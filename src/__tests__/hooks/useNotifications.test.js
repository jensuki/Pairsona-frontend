import { renderHook, act, waitFor } from "@testing-library/react";
import useNotifications from "../../hooks/useNotifications";
import Api from '../../helpers/api';
import { describe, expect, test, vi, beforeEach } from 'vitest';

// mock api.js funcs
vi.mock('../../helpers/api', () => ({
    default: {
        isTokenExpired: vi.fn(),
        getPendingRequests: vi.fn(),
        getUnreadMessages: vi.fn()
    }
}));

beforeEach(() => {
    vi.clearAllMocks();
});

describe('useNotifications hook', () => {
    test('initializes with no notifications or messages', () => {
        const { result } = renderHook(() => useNotifications(null));

        // verify initial state
        expect(result.current.hasNotifications).toBe(false);
        expect(result.current.hasNewMessages).toEqual([]); // empty array
    })

    test('fetches notifications and messages when user is logged in', async () => {
        // define mock user
        const mockUser = { username: 'testuser' };
        // use a valid mock token
        Api.isTokenExpired.mockReturnValue(false);
        Api.getPendingRequests.mockResolvedValue([{ id: 1 }]) // mock 1 pending request
        Api.getUnreadMessages.mockResolvedValue([{ sender_username: 'user1' }]) // mock 1 unread msg

        const { result } = renderHook(() => useNotifications(mockUser));

        // wait for effect to complete
        await waitFor(() => {
            expect(result.current.hasNotifications).toBe(true);
            expect(result.current.hasNewMessages).toEqual(['user1'])
        })
    })

    test('does not fetch notifications if user is null', async () => {
        const { result } = renderHook(() => useNotifications(null));

        // manually call the func
        await act(async () => {
            await result.current.checkNotifications();
        })

        expect(Api.getPendingRequests).not.toHaveBeenCalled();
        expect(Api.getUnreadMessages).not.toHaveBeenCalled();
    })
    test('does not fetch notifications if token is expired', async () => {
        const mockUser = { username: 'testuser' };
        Api.isTokenExpired.mockReturnValue(true); // mock token is expired

        const { result } = renderHook(() => useNotifications(mockUser));

        // manually call the func
        await act(async () => {
            await result.current.checkNotifications();
        });

        expect(Api.getPendingRequests).not.toHaveBeenCalled();
        expect(Api.getUnreadMessages).not.toHaveBeenCalled();
    });

    test('handles errors gracefully', async () => {
        const mockUser = { username: 'testuser' };

        Api.isTokenExpired.mockReturnValue(false);
        Api.getPendingRequests.mockRejectedValue(new Error('Failed to fetch pending requests'));
        Api.getUnreadMessages.mockResolvedValue([]);

        const { result } = renderHook(() => useNotifications(mockUser));

        await act(async () => {
            await result.current.checkNotifications();
        });

        expect(result.current.hasNotifications).toBe(false);
        expect(result.current.hasNewMessages).toEqual([]);
    });
})