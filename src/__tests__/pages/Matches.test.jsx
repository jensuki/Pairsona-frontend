import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { UserProvider } from '../../test_common/setupTests';
import Matches from '../../pages/Matches';
import Api from '../../helpers/api';
import { describe, expect, test, vi, beforeEach } from 'vitest';
import { demoUser, demoMatches } from '../../test_common/mockData';

// mock api.js
vi.mock('../../helpers/api', () => ({
    default: {
        getMatches: vi.fn()
    }
}))

beforeEach(() => {
    vi.clearAllMocks()
    // explicity reset to avoid any residual behavior and ensure isolated tests
    Api.getMatches.mockReset();
})

// helper
const renderMatches = (currUser = demoUser) => {
    return render(
        <MemoryRouter>
            <UserProvider currUser={currUser}>
                <Matches />
            </UserProvider>
        </MemoryRouter>
    )
}

describe('Matches component', () => {
    test('renders without crashing', async () => {
        renderMatches();

        // expect loading spinner
        await waitFor(() => {
            expect(screen.getByRole('status')).toBeInTheDocument();
        })
    });

    test('matches snapshot for user with mbti set', async () => {
        Api.getMatches.mockResolvedValueOnce(demoMatches); // mock api to return matches
        const { asFragment } = renderMatches(); // render mock matches for demouser

        // wait for matches to load
        await waitFor(() => {
            expect(screen.getByText(/Compatible Matches/i)).toBeInTheDocument();
        })

        expect(asFragment()).toMatchSnapshot();
    })

    test('matches snapshot for user without mbti set', async () => {
        const userNoMbti = { ...demoUser, mbti: null }; // create mock user without mbti set
        // mock get matches to return empty array since no matches should be found
        Api.getMatches.mockResolvedValue([]);

        const { asFragment } = renderMatches(userNoMbti);

        // wait for quiz prompt to render
        await waitFor(() => {
            expect(screen.getByText(/Have you taken the quiz\?/i)).toBeInTheDocument();
        })

        expect(asFragment()).toMatchSnapshot();
    })

    test('displays compatible matches when available', async () => {
        Api.getMatches.mockResolvedValueOnce(demoMatches);
        renderMatches();

        await waitFor(() => {
            demoMatches.forEach((match) => {
                const fullName = `${match.firstName} ${match.lastName}`;
                expect(screen.getByText(new RegExp(fullName, 'i'))).toBeInTheDocument();
            });
        });
    });

    test('handles api error gracefully', async () => {
        Api.getMatches.mockRejectedValue(new Error('Failed to fetch matches')); // mock error msg

        renderMatches();

        // wait for component to finish rendering
        await waitFor(() => {
            expect(screen.queryByText(/Compatible Matches/i)).not.toBeInTheDocument();
            expect(screen.getByText(/Failed to fetch matches/i)).toBeInTheDocument();
        });
    });
});
