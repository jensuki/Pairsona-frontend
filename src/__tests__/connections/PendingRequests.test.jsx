import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { UserProvider } from '../../test_common/setupTests';
import PendingRequests from '../../connections/PendingRequests';
import { expect, describe, test, vi, beforeEach } from 'vitest';
import Api from '../../helpers/api';
import { demoConnectionRequests, demoUser } from '../../test_common/mockData';

// mock api calls
vi.mock('../../helpers/api', () => ({
    default: {
        getPendingRequests: vi.fn(),
        acceptConnectionRequest: vi.fn(),
        declineConnectionRequest: vi.fn()
    }
}));

// helper
const renderPendingRequests = () => {
    return render(
        <MemoryRouter>
            <UserProvider currUser={demoUser}>
                <PendingRequests />
            </UserProvider>
        </MemoryRouter>
    );
}

describe('PendingRequests component', () => {
    beforeEach(() => {
        vi.clearAllMocks();

        // common mock setup for pending requests
        Api.getPendingRequests.mockResolvedValue(demoConnectionRequests);
    })

    test('renders without crashing', async () => {
        Api.getPendingRequests.mockResolvedValue([]);

        renderPendingRequests();

        await waitFor(() => {
            expect(screen.getByText(/Connection Requests/i)).toBeInTheDocument();
        })
    })

    test('matches snapshot', async () => {
        const { asFragment } = renderPendingRequests();

        await waitFor(() => {
            expect(screen.getByText(/Connection Requests/i)).toBeInTheDocument();
        })
        // check if the mock is called
        expect(Api.getPendingRequests).toHaveBeenCalled();

        // verify snapshot
        expect(asFragment()).toMatchSnapshot();
    });

    test('displays no requests placeholder when there are no pending requests', async () => {
        Api.getPendingRequests.mockResolvedValue([]);

        renderPendingRequests();
        // expect alt from img to render
        await waitFor(() => {
            expect(screen.getByAltText(/No Requests/i)).toBeInTheDocument();
        });
    });

    test('displays pending requests', async () => {
        renderPendingRequests();

        // expect requesters first and last name to be rendered
        await waitFor(() => {
            demoConnectionRequests.forEach((req) => {
                // use regex match 'User One' exactly
                const fullName = new RegExp(`${req.firstName}\\s+${req.lastName}`, 'i');
                expect(screen.getByText(fullName)).toBeInTheDocument()
            })
        })
    });

    test('handles accepting a connection request', async () => {
        // mock api for accepting
        Api.acceptConnectionRequest.mockResolvedValue();

        renderPendingRequests();

        await waitFor(() => {
            expect(screen.getByText(/Connection Requests/i)).toBeInTheDocument();
        });

        // click the accept button
        const acceptBtn = screen.getByText(/Accept/i);
        fireEvent.click(acceptBtn);

        // verify mock api call was made with correct connection id
        expect(Api.acceptConnectionRequest)
            .toHaveBeenCalledWith(demoConnectionRequests[0].connectionId);

        // proceed to verify the pending requesters name is no longer in list
        await waitFor(() => {
            expect(screen.queryByText(demoConnectionRequests[0].firstName)).not.toBeInTheDocument();
        })
    })

    test('handles declining a connection request', async () => {
        renderPendingRequests();

        await waitFor(() => {
            expect(screen.getByText(/Connection Requests/i)).toBeInTheDocument();
        })

        // click decline button
        const declineBtn = screen.getByText(/Decline/i);
        fireEvent.click(declineBtn);

        // verify api was called with correct connection id
        expect(Api.declineConnectionRequest)
            .toHaveBeenCalledWith(demoConnectionRequests[0].connectionId);

        // proceed to verify the requesters name is no longer in list
        await waitFor(() => {
            expect(screen.queryByText(demoConnectionRequests[0].firstName)).not.toBeInTheDocument();
        })
    })

    test('displays error message when API call fails', async () => {
        // mock api with error msg
        Api.getPendingRequests.mockRejectedValue(new Error('Failed to fetch requests'));

        renderPendingRequests();

        // expect error
        await waitFor(() => {
            expect(screen.getByText(/Failed to fetch requests/i)).toBeInTheDocument();
        });
    });
})