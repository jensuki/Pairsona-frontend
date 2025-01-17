import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { UserProvider } from '../../test_common/setupTests';
import Homepage from '../../pages/Homepage';
import { expect, describe, test } from 'vitest';
import { demoUser } from '../../test_common/mockData';

describe('Homepage component', () => {
    test('renders without crashing', () => {
        render(
            <MemoryRouter>
                <UserProvider>
                    <Homepage />
                </UserProvider>
            </MemoryRouter>
        );
    })

    test('matches snapshot for guests homepage', () => {
        const { asFragment } = render(
            <MemoryRouter>
                <UserProvider currUser={null}>
                    <Homepage />
                </UserProvider>
            </MemoryRouter>
        )
        expect(asFragment()).toMatchSnapshot();
    })

    test('matches snapshot for a logged in users homepage', () => {
        const { asFragment } = render(
            <MemoryRouter>
                <UserProvider currUser={demoUser}>
                    <Homepage />
                </UserProvider>
            </MemoryRouter>
        )

        expect(asFragment()).toMatchSnapshot();
    })

    test('renders home for anon users', () => {
        render(
            <MemoryRouter>
                <UserProvider currUser={null}>
                    <Homepage />
                </UserProvider>
            </MemoryRouter>
        );
        expect(screen.getByAltText(/Guests Home avatar/i)).toBeInTheDocument();
        expect(screen
            .getByRole('link', { name: /Take your MBTI Personality Quiz/i }))
            .toBeInTheDocument();
    })

    test('renders home for logged in users', () => {
        render(
            <MemoryRouter>
                <UserProvider currUser={demoUser}>
                    <Homepage />
                </UserProvider>
            </MemoryRouter>
        )
        expect(screen.getByText(/Welcome Test/i)).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /Get Matched/i })).toBeInTheDocument()
    })
})