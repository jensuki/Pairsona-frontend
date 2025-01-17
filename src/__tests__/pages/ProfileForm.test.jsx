import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { UserProvider } from '../../test_common/setupTests';
import ProfileForm from '../../pages/ProfileForm';
import Api from '../../helpers/api';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { demoUser } from '../../test_common/mockData';

// mock useAuth hook
vi.mock('../../hooks/useAuth', () => ({
    default: vi.fn(() => ({
        currUser: demoUser, // set demouser as curr user
    }))
}));

// mock api func for update
vi.mock('../../helpers/api', () => ({
    default: {
        updateUser: vi.fn(),
    },
}));

// mock profile pic logic
vi.mock('../helpers/getProfilePic', () => ({
    default: vi.fn((pic) => pic || '/assets/default_pic.png'),
}));

// helper
const renderProfileForm = () => {
    return render(
        <MemoryRouter>
            <UserProvider>
                <ProfileForm />
            </UserProvider>
        </MemoryRouter>
    );
};

describe('ProfileForm component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    test('renders without crashing and populates initial values', async () => {
        renderProfileForm();

        // check that the initial values are displayed
        expect(screen.getByLabelText('First Name')).toHaveValue(demoUser.firstName);
        expect(screen.getByLabelText('Last Name')).toHaveValue(demoUser.lastName);
        expect(screen.getByLabelText('Email')).toHaveValue(demoUser.email);
    });

    test('matches snapshot', () => {
        const { asFragment } = renderProfileForm();
        expect(asFragment()).toMatchSnapshot();
    })

    test('updates input fields correctly', () => {
        renderProfileForm();

        // update first and last name
        const firstnameInput = screen.getByLabelText('First Name');
        const lastNameInput = screen.getByLabelText('Last Name');

        fireEvent.change(firstnameInput, { target: { value: 'Updated First Name' } });
        fireEvent.change(lastNameInput, { target: { value: 'Updated Last Name' } });

        expect(firstnameInput.value).toBe('Updated First Name');
        expect(lastNameInput.value).toBe('Updated Last Name');
    })

    test('handles profile pic upload', async () => {
        renderProfileForm();

        // upload a new img file
        const file = new File(['profile-pic'], 'profile-pic.png', { type: 'image/png' });
        const fileInput = screen.getByLabelText('Change Profile Picture');

        fireEvent.change(fileInput, { target: { files: [file] } });

        // wait for the preview to load
        await waitFor(() => {
            expect(screen.getByAltText('Profile Pic Preview')).toBeInTheDocument();
        })
    })

    test('matches snapshot after updating profile pic', async () => {
        const { asFragment } = renderProfileForm();

        const file = new File(['profile-pic'], 'new-pic.png', { type: 'image/png' });
        const fileInput = screen.getByLabelText('Change Profile Picture');

        fireEvent.change(fileInput, { target: { files: [file] } });

        await waitFor(() => {
            expect(asFragment()).toMatchSnapshot();
        })
    })

    test('displays error message on failed form submission', async () => {
        // mock error msg
        Api.updateUser.mockRejectedValueOnce(new Error('Update Failed'));

        renderProfileForm();

        // fill out required password field
        const passwordInput = screen.getByLabelText('Password');
        fireEvent.change(passwordInput, { target: { value: 'password123' } });

        // click save changes
        const saveBtn = screen.getByText('Save Changes');
        fireEvent.click(saveBtn);

        // wait for error msg to appear
        await waitFor(() => {
            expect(screen.getByText('Update Failed')).toBeInTheDocument();
        })
    })


    test('handles successful form submission', async () => {
        Api.updateUser.mockResolvedValueOnce({
            ...demoUser,
            firstName: 'Updated Name'
        })

        renderProfileForm();

        const firstnameInput = screen.getByLabelText('First Name');
        const passwordInput = screen.getByLabelText('Password');

        // update fields
        fireEvent.change(firstnameInput, { target: { value: 'Updated Name' } })
        fireEvent.change(passwordInput, { target: { value: 'password123' } });

        // submit form
        const saveBtn = screen.getByText('Save Changes');
        fireEvent.click(saveBtn);

        await waitFor(() => {
            expect(Api.updateUser).toHaveBeenCalledWith(
                demoUser.username,
                expect.any(FormData)
            )
        })
    })
});