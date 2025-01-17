import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { UserProvider } from '../../test_common/setupTests';
import Messages from '../../pages/Messages';
import Api from '../../helpers/api';
import { describe, expect, test, vi, beforeEach } from 'vitest';
import { demoUser } from '../../test_common/mockData';

// mock api methods
vi.mock('../../helpers/api', () => ({

    default: {
        getMessages: vi.fn(),
        markMessageAsRead: vi.fn(),
        sendMessage: vi.fn()
    }
}))

// mock userParams
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual, // import actual module
        useParams: () => ({ username: 'user3' }), // mock username to return 'user3'
    };
});

// helper
const renderMessages = () => {
    return render(
        <MemoryRouter>
            <UserProvider currUser={demoUser}>
                <Messages />
            </UserProvider>
        </MemoryRouter>
    )
}

describe('Messages component', () => {
    beforeEach(() => {
        vi.clearAllMocks();

        // mock api repsonse to return predefined array of msgs
        Api.getMessages.mockResolvedValue([
            {
                id: 1,
                sender_id: 2,
                recipient_id: 1, // demouser receives
                content: 'Hello!',
                created_at: '2023-01-01T12:00:00Z',
                is_read: false, // unread
            },
            {
                id: 2,
                sender_id: 1, // demouser sends
                recipient_id: 2,
                content: 'Hi there!',
                created_at: '2023-01-01T12:01:00Z',
                is_read: true, // read
            },
        ]);
    });

    test('renders without crashing and displays username from useParams', async () => {
        renderMessages();

        // wait for 'user3' to be displayed in dom
        await waitFor(() =>
            expect(screen.getByText(/Chat with user3/i)).toBeInTheDocument()
        );
        // verify mock msgs are rendered
        expect(screen.getByText('Hello!')).toBeInTheDocument()
        expect(screen.getByText('Hi there!')).toBeInTheDocument();
    });

    test('matches snapshot', async () => {
        const { asFragment } = renderMessages();

        await waitFor(() => {
            expect(asFragment()).toMatchSnapshot();
        })

    });

    test('marks unread messages as read on render', async () => {
        renderMessages();

        await waitFor(() => {
            expect(Api.markMessageAsRead).toHaveBeenCalledWith(1); // id of the unread msg
        })
    })
    test('sends a new message', async () => {
        // mock a new message being sent
        Api.sendMessage.mockResolvedValue({
            message: {
                id: 3,
                sender_id: 1,
                recipient_id: 2,
                content: 'New message!',
                created_at: '2023-01-01T12:02:00Z',
            },
        });

        renderMessages();

        // simulate typing the new msg
        const input = screen.getByPlaceholderText('Type your message...');
        fireEvent.change(input, { target: { value: 'New message!' } });

        // click send
        const sendBtn = screen.getByText('Send');
        fireEvent.click(sendBtn);

        // wait for new msg to appear
        await waitFor(() => {
            expect(screen.getByText('New message!')).toBeInTheDocument();
        })

        // ensure api was called
        expect(Api.sendMessage).toHaveBeenCalledWith('user3', 'New message!')
    })
});