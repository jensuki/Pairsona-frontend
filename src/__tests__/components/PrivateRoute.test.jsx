import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { UserProvider } from '../../test_common/setupTests';
import { demoUser } from '../../test_common/mockData';
import PrivateRoute from '../../components/PrivateRoute';
import { expect, test, describe } from 'vitest';

describe('PrivateRoute component', () => {
    test('renders without crashing', () => {
        render(
            <MemoryRouter>
                <UserProvider>
                    <PrivateRoute />
                </UserProvider>
            </MemoryRouter>
        )
    })

    test('matches snapshot', () => {
        const { asFragment } = render(
            <MemoryRouter>
                <UserProvider>
                    <PrivateRoute>
                        <div>Private Content</div>
                    </PrivateRoute>
                </UserProvider>
            </MemoryRouter>
        )
        expect(asFragment()).toMatchSnapshot();
    })

    test('renders children when user is authenticated', () => {
        render(
            <MemoryRouter>
                <UserProvider currUser={demoUser}>
                    <PrivateRoute>
                        <div>Private Content</div>
                    </PrivateRoute>
                </UserProvider>
            </MemoryRouter>
        )
        // verify private content is rendered while demoUser is authenticated
        expect(screen.getByText('Private Content')).toBeInTheDocument();
    })

    test('redirects to login when user not authenticated', () => {
        render(
            <MemoryRouter initialEntries={['/private']}>
                <Routes>
                    <Route path="/login" element={<div>Log In</div>} />
                    <Route
                        path="/private"
                        element={
                            <UserProvider currUser={null}>
                                <PrivateRoute>
                                    <div>Private Content</div>
                                </PrivateRoute>
                            </UserProvider>
                        }
                    />
                </Routes>
            </MemoryRouter>
        );
        // ensure private content isnt rendered
        expect(screen.queryByText('Private Content')).not.toBeInTheDocument();

        // verify redirection to /login
        expect(screen.getByText('Log In')).toBeInTheDocument();
    });

})