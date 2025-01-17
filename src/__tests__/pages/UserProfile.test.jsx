import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { UserProvider } from '../../test_common/setupTests';
import UserProfile from '../../pages/UserProfile';
import Api from '../../helpers/api';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { demoUser, demoConnections, demoConnectionRequests } from '../../test_common/mockData';

// mock api funcs
vi.mock('../../helpers/api', () => ({
    default: {
        getUserProfile: vi.fn(),
        getSentRequests: vi.fn(),
        getPendingRequests: vi.fn(),
        getConnections: vi.fn(),
        sendConnectionRequest: vi.fn(),
        cancelConnectionRequest: vi.fn(),
        acceptConnectionRequest: vi.fn()
    }
}))

const renderUserProfile = () => {
    return render(
        <MemoryRouter>
            <UserProvider currUser={demoUser}>
                <UserProfile />
            </UserProvider>
        </MemoryRouter>
    )
}

describe('UserProfile component', () => {
    beforeEach(() => {
        vi.clearAllMocks();

        // mock responses
        Api.getUserProfile.mockResolvedValue(demoUser); // mock demouser profile data
        Api.getSentRequests.mockResolvedValue([]);
        Api.getPendingRequests.mockResolvedValue(demoConnectionRequests);
        Api.getConnections.mockResolvedValue(demoConnections);
    })

    test('renders without crashing and displays curr user info', async () => {
        renderUserProfile();

        // wait for users name to appear in the dom
        await waitFor(() => {
            expect(screen.getByText(`${demoUser.firstName} ${demoUser.lastName}`)).toBeInTheDocument();

        })
        // expect other fields to be present
        const formattedBirthDate = new Date(demoUser.birthDate).toLocaleDateString('en-US');
        expect(screen.getByText(formattedBirthDate)).toBeInTheDocument()
        // expect edit profile since viewing logged in users own profile
        expect(screen.getByText('Edit Profile')).toBeInTheDocument();
    })

    test('matches snapshot', async () => {
        const { asFragment } = renderUserProfile();

        // Wait for the user's name to appear (indicating the component has finished loading)
        await waitFor(() => {
            expect(screen.getByText(`${demoUser.firstName} ${demoUser.lastName}`)).toBeInTheDocument();
        });

        // Capture the snapshot after the component has finished rendering
        expect(asFragment()).toMatchSnapshot();
    });

    test('displays loading spinner while fetching data', async () => {
        const { getByRole } = renderUserProfile();

        await waitFor(() => {
            expect(getByRole('status')).toBeInTheDocument();
        })
    });

    test('renders cancel connection button if connection is sent', async () => {
        // use first user from mock connections
        const otherUser = demoConnections[0];

        // mock api response for other users profile and connection data
        Api.getUserProfile.mockResolvedValueOnce(otherUser); // mock other profile being viewed
        Api.getSentRequests.mockResolvedValueOnce([
            {
                username: otherUser.username,
                connectionId: 1
            }
        ]);

        Api.getConnections.mockResolvedValueOnce([]); // no confirmed connection with this profile

        renderUserProfile(); //

        // wait for 'cancel connection request' button to appear on other users profile
        await waitFor(() => {
            expect(screen.getByText('Cancel Connection Request')).toBeInTheDocument();
        })
    })

    test('renders accept connection button for a received connection request', async () => {
        // use first user from mock connections
        const otherUser = demoConnections[0];

        // mock api response
        Api.getUserProfile.mockResolvedValueOnce(otherUser); // mock other user's profile
        Api.getPendingRequests.mockResolvedValueOnce([
            {
                connectionId: 1,
                username: otherUser.username,
                sender: otherUser.username, // sender is otherUser
                recipient: demoUser.username, // recipient is the curr user
                status: 'pending',
            },
        ]);
        Api.getConnections.mockResolvedValueOnce([]); // no confirmed connections between the two

        renderUserProfile();

        // wait for 'accept connection request' button to appear
        await waitFor(() => {
            expect(screen.getByText('Accept Connection Request')).toBeInTheDocument();
        });

        // click accept button
        const acceptButton = screen.getByText('Accept Connection Request');
        fireEvent.click(acceptButton);

        // ensure correct connection id was accepted
        await waitFor(() => {
            expect(Api.acceptConnectionRequest).toHaveBeenCalledWith(1);
        });
    });

    test('renders connected options if users are connected', async () => {
        const otherUser = demoConnections[0];

        Api.getUserProfile.mockResolvedValueOnce(otherUser); // mock other users profile
        Api.getConnections.mockResolvedValueOnce([
            {
                connectionId: 1,
                username: otherUser.username, // mock a confirmed connection with the other user
            },
        ]);

        renderUserProfile();

        // wait for 'connected' button to appear
        await waitFor(() => {
            expect(screen.getByText('Connected')).toBeInTheDocument();
            expect(screen.getByText(`Chat with ${otherUser.firstName}`)).toBeInTheDocument();
        });
    });
})
