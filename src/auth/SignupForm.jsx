import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import UserContext from '../context/UserContext';
import ReactGoogleAutocomplete from 'react-google-autocomplete'; // for autocomplete dropdown
import Loading from '../components/Loading';
import '../styles/Forms.css';

const SignupForm = () => {
    const { signup } = useContext(UserContext);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        username: '',
        password: '',
        firstName: '',
        lastName: '',
        email: '',
        birthDate: '',
        location: '',
        bio: '',
        profilePic: null // for file upload
    });

    const [picPreview, setPicPreview] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    // handle form input change
    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === 'bio' && value.length > 100) {
            setError('Bio cannot exceed 100 characters');
        } else {
            setError(null); // clear the error
        }

        setFormData((fData) => ({
            ...fData,
            [name]: value
        }));
    }

    // handle location suggestion autocomplete
    const handleLocationChange = (city) => {
        setFormData((fData) => ({
            ...fData,
            location: city.formatted_address // store formatted address
        }));
    };

    // handle image file upload + create preview
    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData((fData) => ({
                ...fData,
                profilePic: file,
            }));

            // generate preview
            setPicPreview(URL.createObjectURL(file));
        }
    };

    // handle signup form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);// clear prev errors
        setLoading(true); // spinner

        try {
            const formDataToSend = new FormData();
            // append all fields including img
            for (let key in formData) {
                formDataToSend.append(key, formData[key]);
            }

            await signup(formDataToSend);
            navigate('/');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <Loading />

    return (
        <div className="FormContainer SignupForm">
            <h1>Sign Up</h1>
            <form onSubmit={handleSubmit}
                encType="multipart/form-data"
                autoComplete="off">

                {error && <p className="error" role="alert">{error}</p>}

                {/* username input */}
                <div className="form-group">
                    <label htmlFor="username">Username</label>
                    <input
                        type="text"
                        name="username"
                        id="username"
                        value={formData.username}
                        onChange={handleChange}
                        placeholder="Enter your username"
                        autoComplete="new-username"
                        required />
                </div>

                {/* password input */}
                <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <input
                        type="password"
                        name="password"
                        id="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Enter your password"
                        autoComplete="new-password"
                        required />
                </div>

                {/* first name input */}
                <div className="form-group">
                    <label htmlFor="firstName">First Name</label>
                    <input
                        type="text"
                        name="firstName"
                        id="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        placeholder="Enter your first name"
                        required />
                </div>

                {/* last name input */}
                <div className="form-group">
                    <label htmlFor="lastName">Last Name</label>
                    <input
                        type="text"
                        name="lastName"
                        id="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        placeholder="Enter your last name"
                        required />
                </div>

                {/* email input */}
                <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input
                        type="email"
                        name="email"
                        id="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Enter your email"
                        required />
                </div>

                {/* birth date input */}
                <div className="form-group">
                    <label htmlFor="birthDate">Birth Date:</label>
                    <input
                        type="date"
                        name="birthDate"
                        id="birthDate"
                        value={formData.birthDate}
                        onChange={handleChange}
                        required />
                </div>

                {/* location input with autocomplete */}
                <div className="form-group">
                    <label htmlFor="location">Location</label>
                    <ReactGoogleAutocomplete
                        apiKey={import.meta.env.VITE_GOOGLE_PLACES_API_KEY}
                        onPlaceSelected={handleLocationChange}
                        options={{ types: ['(cities)'] }} // restrict to cities
                        placeholder="Type a city"
                        required />
                </div>

                {/* optional bio input */}
                <div className="form-group">
                    <label htmlFor="bio">Bio</label>
                    <textarea
                        name="bio"
                        id="bio"
                        value={formData.bio}
                        onChange={handleChange}
                        placeholder="Tell us about yourself (optional)" />
                </div>

                {/* profile picture upload */}
                <div className="form-group">
                    <label htmlFor="profilePic">Profile Picture</label>
                    <input
                        type="file"
                        name="profilePic"
                        id="profilePic"
                        onChange={handleFileUpload}
                        accept="image/*"
                    />
                </div>

                {/* pic preview */}
                {picPreview && (
                    <div className="pic-preview">
                        <img
                            src={picPreview}
                            alt="Profile Preview"
                        />
                    </div>
                )}

                {/* submit button */}
                <button type="submit" className="signup-btn">Signup</button>
            </form>
        </div>
    )
}

export default SignupForm;