import { render, screen, fireEvent } from '@testing-library/react';
import { UserProvider } from '../../test_common/setupTests';
import { demoUser } from '../../test_common/mockData';
import { MemoryRouter } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { expect, describe, test, vi } from 'vitest';

describe('Navbar component', () => {
    test('renders without crashing', () => {
        render(
            <MemoryRouter>
                <UserProvider>
                    <Navbar />
                </UserProvider>
            </MemoryRouter>
        )

        expect(screen.getByRole('navigation')).toBeInTheDocument();
    });

    test('matches snapshot for anon user', () => {
        const { asFragment } = render(
            <MemoryRouter>
                <UserProvider>
                    <Navbar />
                </UserProvider>
            </MemoryRouter>
        )

        expect(asFragment()).toMatchSnapshot();
    });

    test('matches snapshot for logged in user', () => {
        const { asFragment } = render(
            <MemoryRouter>
                <UserProvider currUser={demoUser}>
                    <Navbar />
                </UserProvider>
            </MemoryRouter>
        )

        expect(asFragment()).toMatchSnapshot();
    });

    test('renders proper links for anon user', () => {
        const { getByText } = render(
            <MemoryRouter>
                <UserProvider currUser={null}>
                    <Navbar />
                </UserProvider>
            </MemoryRouter>
        )

        expect(getByText('Login')).toBeInTheDocument();
        expect(getByText('Sign Up')).toBeInTheDocument();
    })

    test('renders proper links for logged in user', () => {
        render(
            <MemoryRouter>
                <UserProvider currUser={demoUser}>
                    <Navbar />
                </UserProvider>
            </MemoryRouter>
        )

        expect(screen.getByText(demoUser.firstName)).toBeInTheDocument();
        expect(screen.getByText('Find Matches')).toBeInTheDocument();
        expect(screen.getByText('Notifications')).toBeInTheDocument();
        expect(screen.getByText('Connections')).toBeInTheDocument();
        expect(screen.getByText('Log Out')).toBeInTheDocument();
    })

    test('shows notification indicator for logged in user', () => {
        render(
            <MemoryRouter>
                <UserProvider currUser={demoUser} hasNotifications={true}>
                    <Navbar />
                </UserProvider>
            </MemoryRouter>
        )
        // confirm the notification dot is rendered
        const notificationDot = screen.getByText('Notifications').querySelector('.notification-dot')
        expect(notificationDot).toBeInTheDocument();
    })

    test('shows unread message indicator for logged in user', () => {
        const mockUnreadMsg = ['msg1'];

        render(
            <MemoryRouter>
                <UserProvider currUser={demoUser} hasNewMessages={mockUnreadMsg}>
                    <Navbar />
                </UserProvider>
            </MemoryRouter>
        )
        // confirm the notification dot is rendered
        const unreadMsgDot = screen.getByText('Connections').querySelector('.notification-dot');
        expect(unreadMsgDot).toBeInTheDocument();
    })

    test('calls logout func when log out button is clicked', () => {
        const mockLogout = vi.fn();

        render(
            <MemoryRouter>
                <UserProvider currUser={demoUser} logout={mockLogout}>
                    <Navbar />
                </UserProvider>
            </MemoryRouter>
        )

        fireEvent.click(screen.getByText('Log Out'));
        expect(mockLogout).toHaveBeenCalled();
    })
})
