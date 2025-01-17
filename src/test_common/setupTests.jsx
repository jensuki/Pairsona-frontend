/* eslint-disable react/prop-types */
import { useState } from 'react';
import '@testing-library/jest-dom';
import UserContext from '../context/UserContext';
import { vi } from 'vitest';

// mock preview url for img file
globalThis.URL.createObjectURL = vi.fn(() => 'mock-preview-url');

// mock user provider for testing
const UserProvider = ({
    children,
    currUser = null,
    signup = vi.fn(),
    login = vi.fn(),
    logout = vi.fn(),
    hasNotifications = false,
    hasNewMessages = [], // default to array
    checkNotifications = vi.fn(),
    loading = false
}) => {
    const [user, setUser] = useState(currUser);

    return (
        <UserContext.Provider
            value={{
                currUser: user,
                setCurrUser: setUser,
                signup,
                login,
                logout,
                hasNotifications,
                hasNewMessages,
                checkNotifications,
                loading
            }}
        >
            {children}
        </UserContext.Provider>
    );
};

export { UserProvider };
