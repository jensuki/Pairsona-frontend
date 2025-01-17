import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { UserProvider } from '../../test_common/setupTests';
import Results from '../../quiz/Results';
import Api from '../../helpers/api';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { demoUser } from '../../test_common/mockData';

// mock api funcs
vi.mock('../../helpers/api', () => ({
    default: {
        getMbtiDetails: vi.fn()
    }
}))

// helper
const renderResults = () => {
    return render(
        <MemoryRouter>
            <UserProvider currUser={demoUser}>
                <Results />
            </UserProvider>
        </MemoryRouter>
    )
}

describe('Results component', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    test('renders without crashing', async () => {
        renderResults();

        // expect spinner
        await waitFor(() => {
            expect(screen.getByRole('status')).toBeInTheDocument();
        })
    })

    test('matches snpashot initially', async () => {
        const { asFragment } = renderResults();

        await waitFor(() => {
            expect(asFragment()).toMatchSnapshot();
        })
    })

    test('matches snapshot with results', async () => {
        // mock successful api response
        Api.getMbtiDetails.mockResolvedValueOnce({
            type: "INFJ",
            title: "The Advocate",
            percentage: "1.5%",
            description: "Advocates are quiet visionaries, often serving as inspiring and tireless idealists.",
            site: "https://www.16personalities.com/infj-personality"
        })

        const { asFragment } = renderResults();

        // wait for results to appear
        await waitFor(() => {
            expect(screen.getByText(/Your Result:/i)).toBeInTheDocument();
        })

        expect(asFragment()).toMatchSnapshot();
    })
    test('displays the mbti type along with results on the page', async () => {
        // mock successful api response
        Api.getMbtiDetails.mockResolvedValueOnce({
            type: "INFJ",
            title: "The Advocate",
            percentage: "1.5%",
            description: "Advocates are quiet visionaries, often serving as inspiring and tireless idealists.",
            site: "https://www.16personalities.com/infj-personality"
        });

        renderResults();

        // wait for results to load
        await waitFor(() => {
            expect(screen.getByText(/Your result:/i)).toBeInTheDocument();

            // verify "INFJ" h3 element is displayed
            const mbtiType = screen.getByRole('heading', { level: 3 });
            expect(mbtiType).toHaveTextContent('INFJ');
        })
    });

    test('displays error message on API failure', async () => {
        // mock error msg
        Api.getMbtiDetails.mockRejectedValueOnce(new Error('Failed to fetch results'));

        renderResults();

        await waitFor(() => {
            expect(screen.getByText(/failed to fetch results/i)).toBeInTheDocument();
        });

        // Ensure loading spinner is removed
        expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });
})