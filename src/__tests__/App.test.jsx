import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from '../App';
import { describe, test, expect } from 'vitest';

describe('App component', () => {
    test('renders without crashing', () => {
        render(
            <MemoryRouter>
                <App />
            </MemoryRouter>
        );
        expect(screen.getByText(/Authentic/i)).toBeInTheDocument();
    });

    test('matches snapshot', () => {
        const { asFragment } = render(
            <MemoryRouter>
                <App />
            </MemoryRouter>
        );
        expect(asFragment()).toMatchSnapshot();
    });
});
