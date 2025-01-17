import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { UserProvider } from '../../test_common/setupTests';
import SignupForm from '../../auth/SignupForm';
import { describe, test, expect, vi, beforeEach } from 'vitest';

// mock signup func
const mockSignup = vi.fn().mockResolvedValue({ success: true });

// helper
const renderSignupForm = () => {
    return render(
        <MemoryRouter>
            <UserProvider signup={mockSignup}>
                <SignupForm />
            </UserProvider>
        </MemoryRouter>
    );
};

// mock ReactGoogleAutocomplete input
vi.mock('react-google-autocomplete', () => ({
    default: (props) => (
        <input
            id="location"
            data-testid="autocomplete"
            required={props.required}
            placeholder={props.placeholder}
            onChange={(e) => props.onPlaceSelected({ formatted_address: e.target.value })}
        />
    ),
}));

describe('SignupForm component', () => {
    beforeEach(() => {
        mockSignup.mockClear();
    });

    test('renders without crashing', () => {
        renderSignupForm();

        const fieldLabels = [
            'Username',
            'Password',
            'First Name',
            'Last Name',
            'Email',
            'Birth Date',
            'Location',
            'Bio',
            'Profile Picture',
        ];

        // verify all labels are displayed
        fieldLabels.forEach((label) => {
            expect(screen.getByLabelText(new RegExp(label, 'i'))).toBeInTheDocument();
        });
    });

    test('matches snapshot', () => {
        const { asFragment } = renderSignupForm();
        expect(asFragment()).toMatchSnapshot();
    });

    test('handles user input correctly', () => {
        renderSignupForm();

        const usernameInput = screen.getByLabelText(/Username/i);
        fireEvent.change(usernameInput, { target: { value: 'testuser' } });

        expect(usernameInput.value).toBe('testuser');
    });

    test('handles file upload', () => {
        renderSignupForm();

        const fileInput = screen.getByLabelText(/Profile Picture/i);
        const file = new File(['test'], 'test_img.png', { type: 'image/png' });

        // simulate file upload + verify it was added
        fireEvent.change(fileInput, { target: { files: [file] } });
        expect(fileInput.files[0]).toBe(file);
        expect(fileInput.files).toHaveLength(1);
    });

    test('displays error for bio > 100 characters', () => {
        renderSignupForm();

        const bioInput = screen.getByLabelText(/Bio/i);

        // simulate exceeding valid bio length
        fireEvent.change(bioInput, {
            target: { value: 'A'.repeat(101) }
        });

        // expect error message to render
        expect(screen.getByText(/Bio cannot exceed 100 characters/i)).toBeInTheDocument();
    });

    test('handles location selection correctly', async () => {
        renderSignupForm();

        const locationInput = screen.getByPlaceholderText(/Type a city/i);
        fireEvent.change(locationInput, { target: { value: 'New York, NY' } });

        // expect location value to be properly updated
        await waitFor(() => {
            expect(locationInput.value).toBe('New York, NY');
        });
    });

    test('calls signup func on valid submission', async () => {
        renderSignupForm();

        const fieldValues = {
            Username: 'testuser',
            Password: 'password123',
            'First Name': 'Test',
            'Last Name': 'User',
            Email: 'test@test.com',
            'Birth Date': '2000-01-01',
            Bio: 'This is a test bio.',
        };

        // fill out form fields
        Object.entries(fieldValues).forEach(([label, value]) => {
            const input = screen.getByLabelText(new RegExp(label, 'i'));
            fireEvent.change(input, { target: { value } });
        });

        // simulate location selection
        const locationInput = screen.getByPlaceholderText(/Type a city/i);
        fireEvent.change(locationInput, { target: { value: 'New York, NY' } });

        // submit the form
        const submitButton = screen.getByRole('button', { name: /signup/i });
        fireEvent.click(submitButton);

        // verify signup func was called
        await waitFor(() => {
            expect(mockSignup).toHaveBeenCalled();
            // get first argument passed to mocksignup to validate content
            const formData = mockSignup.mock.calls[0][0]; // get the formdata obj
            expect(formData.get('username')).toBe('testuser');
            expect(formData.get('location')).toBe('New York, NY');
        });
    });

    test('displays error message on signup failure', async () => {
        // simulate a server error during signup
        mockSignup.mockRejectedValue(new Error('Signup Failed'));

        renderSignupForm();

        // fill out fields
        fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'testuser' } });
        fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
        fireEvent.change(screen.getByLabelText(/first name/i), { target: { value: 'Test' } });
        fireEvent.change(screen.getByLabelText(/last name/i), { target: { value: 'User' } });
        fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@test.com' } });
        fireEvent.change(screen.getByLabelText(/birth date/i), { target: { value: '2000-01-01' } });

        const locationInput = screen.getByPlaceholderText(/Type a city/i);
        fireEvent.change(locationInput, { target: { value: 'New York, NY' } });

        // submit form
        const signupBtn = screen.getByRole('button', { name: /signup/i });
        fireEvent.click(signupBtn);

        // wait for error msg to appear
        const errorMessage = await screen.findByRole('alert');
        expect(errorMessage).toHaveTextContent(/Signup Failed/i);
    });

    test('displays specific error message for invalid username', async () => {
        // mock error for invalid username field
        mockSignup.mockRejectedValue(new Error('Username must be at least 5 characters'));

        renderSignupForm();

        // fill out form with invalid username
        fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'abc' } }); // invalid
        fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
        fireEvent.change(screen.getByLabelText(/first name/i), { target: { value: 'Test' } });
        fireEvent.change(screen.getByLabelText(/last name/i), { target: { value: 'User' } });
        fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@test.com' } });
        fireEvent.change(screen.getByLabelText(/birth date/i), { target: { value: '2000-01-01' } });

        const locationInput = screen.getByPlaceholderText(/Type a city/i);
        fireEvent.change(locationInput, { target: { value: 'New York, NY' } });

        // submit
        const signupBtn = screen.getByRole('button', { name: /signup/i });
        fireEvent.click(signupBtn);

        // verify the proper error msg is rendered
        const errorMessage = await screen.findByRole('alert');
        expect(errorMessage).toHaveTextContent(/Username must be at least 5 characters/i);
    });

});
