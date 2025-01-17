import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { UserProvider } from '../../test_common/setupTests';
import ConnectedUsers from '../../connections/ConnectedUsers';
import { expect, describe, test, vi, beforeEach } from 'vitest';
import Api from '../../helpers/api';
import { demoConnections, demoNotifications, demoUser } from '../../test_common/mockData';

// mock api calls
vi.mock('../../helpers/api', () => ({
    default: {
        getConnections: vi.fn(),
        removeConnection: vi.fn(),
    },
}));

// mock useNavigate
const mockNavigate = vi.fn();

vi.mock('react-router-dom', async (importActual) => {
    const actual = await importActual(); // import actual module
    return {
        ...actual, // keep original exports
        useNavigate: () => mockNavigate
    }
})

// helper
const renderConnectedUsers = () => {
    return render(
        <MemoryRouter>
            <UserProvider
                currUser={demoUser}>
                <ConnectedUsers />
            </UserProvider>
        </MemoryRouter >
    );
};

describe('ConnectedUsers component', () => {
    beforeEach(() => {
        vi.clearAllMocks();

        // common mock setup for connected users
        Api.getConnections.mockResolvedValue(demoConnections);
    });

    test('renders without crashing', async () => {
        renderConnectedUsers();

        await waitFor(() => {
            expect(screen.getByText(/Your Connections/i)).toBeInTheDocument();
        });

        // verify user3 connection is rendered
        expect(screen.getByText(/User\s+Three/i)).toBeInTheDocument();
    });

    test('matches snapshot', async () => {
        const { asFragment } = renderConnectedUsers();

        await waitFor(() => {
            expect(screen.getByText(/Your Connections/i)).toBeInTheDocument();
        });

        // check if the mock is called
        expect(Api.getConnections).toHaveBeenCalled();

        // verify snapshot
        expect(asFragment()).toMatchSnapshot();
    });

    test('displays list of connections', async () => {
        renderConnectedUsers();

        // verify connection details are rendered
        await waitFor(() => {
            demoConnections.forEach((conn) => {
                expect(screen.getByText(`${conn.firstName} ${conn.lastName}`)).toBeInTheDocument();
            })
        })
    })

    test('removes a connection when "remove" button is clicked', async () => {
        // mock successful api repsonse for removal
        Api.removeConnection.mockResolvedValue();

        renderConnectedUsers();

        // wait for connections to render
        await waitFor(() => {
            expect(screen.getByText(/User\s+Three/i)).toBeInTheDocument();
        })

        // click remove
        const removeBtn = screen.getByText(/Remove/i);
        fireEvent.click(removeBtn);

        // ensure api call was made for removing connection set in mock data
        expect(Api.removeConnection).toHaveBeenCalledWith(demoConnections[0].connectionId);

        // ensure no more connection
        await waitFor(() => {
            expect(screen.queryByText(/User\s+Three/i)).not.toBeInTheDocument();
        })
    })

    test('navigates to chat page on "Chat with {username}" click', async () => {
        renderConnectedUsers();

        // verify the chat btn is rendered
        await waitFor(() => {
            expect(screen.getByText(/Chat with User/i)).toBeInTheDocument();
        })

        // click chat btn
        const chatBtn = screen.getByText(/Chat With User/i);
        fireEvent.click(chatBtn);

        // verify proper navigation to chat page with user3 through custom navigate hook
        expect(mockNavigate).toHaveBeenCalledWith(`/messages/${demoConnections[0].username}`)

    })

    test('displays notification dot for users with new messages', async () => {
        render(
            <MemoryRouter>
                <UserProvider
                    currUser={demoUser}
                    hasNewMessages={demoNotifications.hasNewMessages}>
                    <ConnectedUsers />
                </UserProvider>
            </MemoryRouter>
        )
        // wait for connections to render
        await waitFor(() => {
            expect(screen.getByText(/User Three/i)).toBeInTheDocument();
        })

        // check if notifcation dot exists for user3
        const notificationDot = screen.getByText(/User Three/i)
            .closest('.connection-info')
            .querySelector('.notification-dot');

        expect(notificationDot).toBeInTheDocument();
    })

    test('displays error message when API call fails', async () => {
        // mock api with error msg
        Api.getConnections.mockRejectedValue(new Error('Failed to fetch connections'));

        render(
            <MemoryRouter>
                <UserProvider
                    currUser={demoUser}>
                    <ConnectedUsers />
                </UserProvider>
            </MemoryRouter>
        );

        // expect error msg to render
        await waitFor(() => {
            const errorMessage = screen.getByText(/Failed to fetch connections/i);
            expect(errorMessage).toBeInTheDocument();
        });
    });
})