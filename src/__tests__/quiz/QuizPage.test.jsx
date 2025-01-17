import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { UserProvider } from '../../test_common/setupTests';
import QuizPage from '../../quiz/QuizPage';
import Api from '../../helpers/api';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { demoUser } from '../../test_common/mockData';

// mock api funcs + sample questions
vi.mock('../../helpers/api', () => ({
    default: {
        getQuestions: vi.fn().mockResolvedValue([
            {
                id: 1,
                text: 'Do you make lists or rely on memory?',
                options: [
                    { text: "makes lists", value: "S" },
                    { text: "relies on memory", value: "N" }
                ]
            },
            {
                id: 2,
                text: 'Do you prefer structured plans or spontaneity?',
                options: [
                    { text: "structured plans", value: "J" },
                    { text: "spontaneity", value: "P" }
                ]
            }
        ]),
        submitQuiz: vi.fn().mockResolvedValue({ type: "INFJ" }) // mock mbti set
    }
}))

// mock usenavigate
const mockNavigate = vi.fn();

vi.mock('react-router-dom', async (importActual) => {
    const actual = await importActual(); // import actual module
    return {
        ...actual, // keep original exports
        useNavigate: () => mockNavigate
    }
})

//helper
const renderQuizPage = () => {
    return render(
        <MemoryRouter>
            <UserProvider currUser={demoUser}>
                <QuizPage />
            </UserProvider>
        </MemoryRouter>
    );
};

describe('QuizPage component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    test('renders without crashing and displays first question', async () => {
        renderQuizPage();

        // wait for first question to load
        await waitFor(() => {
            expect(screen.getByText('Do you make lists or rely on memory?')).toBeInTheDocument();
        })

        expect(Api.getQuestions).toHaveBeenCalledTimes(1);
    })
    test('matches snapshot', async () => {
        const { asFragment } = renderQuizPage();

        // wait for the next arrow button to appear with class
        await waitFor(() => {
            const nextBtn = screen
                .getByRole('button', { name: /Next question/i })
                .querySelector('.fa-arrow-right');
            expect(nextBtn).toBeInTheDocument()
        });

        expect(asFragment()).toMatchSnapshot();
    });

    test('allows navigating between questions', async () => {
        const { getByText, getByRole } = renderQuizPage();

        await waitFor(() => {
            expect(getByText('Do you make lists or rely on memory?')).toBeInTheDocument();
        })

        // select first option
        const firstOption = getByRole('radio', { name: /makes lists/i })
        fireEvent.click(firstOption);
        // click next arrow
        const nextBtn = getByRole('button', { name: /next question/i });
        fireEvent.click(nextBtn);

        // wait or second question to appear
        await waitFor(() => {
            expect(getByText('Do you prefer structured plans or spontaneity?')).toBeInTheDocument();
        })

        // click back arrow button to go back to previous question
        const prevBtn = getByRole('button', { name: /previous question/i });
        fireEvent.click(prevBtn);

        // ensure first question is displayed again
        await waitFor(() => {
            expect(getByText('Do you make lists or rely on memory?')).toBeInTheDocument()
        })
    })

    test('disables next question button if no option is selected', async () => {
        const { getByText, getByRole } = renderQuizPage();

        await waitFor(() => {
            expect(getByText(/do you make lists or rely on memory?/i)).toBeInTheDocument();
        });

        // click next without choosing option
        const nextBtn = getByRole('button', { name: /next question/i });
        expect(nextBtn).toBeDisabled();
    })

    test('submits the quiz and redirects to /results page', async () => {
        const { getByRole } = renderQuizPage();

        // Wait for the first question to load
        await waitFor(() => {
            expect(screen.getByText(/do you make lists or rely on memory?/i)).toBeInTheDocument();
        });

        // answer all quiz questions
        const first = getByRole('radio', { name: /makes lists/i });
        fireEvent.click(first);

        const next = getByRole('button', { name: /next question/i });
        fireEvent.click(next)

        const second = getByRole('radio', { name: /structured plans/i });
        fireEvent.click(second);

        // click submit
        const submitBtn = getByRole('button', { name: /submit/i });
        fireEvent.click(submitBtn);

        // expect correct data
        expect(Api.submitQuiz).toHaveBeenCalledWith({
            answers: { 1: "S", 2: "J" }
        })

        // ensure redirection to /results
        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('/results');
        })
    })
    test('handles API errors gracefully', async () => {
        // mock an error msg to be thrown
        Api.getQuestions.mockRejectedValueOnce(new Error('Failed to fetch questions'));

        renderQuizPage();

        // wait for erro to appear
        await waitFor(() => {
            expect(screen.getByText(/failed to fetch questions/i)).toBeInTheDocument();
        });

        // no more spinner
        expect(screen.queryByRole('status')).not.toBeInTheDocument();

        // verify that no questions are displayed
        expect(screen.queryByText(/do you make lists or rely on memory?/i)).not.toBeInTheDocument();
    });
});
