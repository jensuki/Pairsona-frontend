import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlacesWidget } from 'react-google-autocomplete';
import getProfilePic from '../helpers/getProfilePic';
import Loading from '../components/Loading';
import useAuth from '../hooks/useAuth';
import Api from '../helpers/api';
import '../styles/Forms.css';

/** component to update current users profile */
const ProfileForm = () => {
    const { currUser, setCurrUser } = useAuth();

    const navigate = useNavigate();

    // state
    const [formData, setFormData] = useState({
        username: '',
        firstName: '',
        lastName: '',
        email: '',
        birthDate: '',
        location: '',
        bio: '',
        profilePic: null,
        password: ''
    });
    const [picPreview, setPicPreview] = useState(getProfilePic(null));
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    // usePlacesWidget reference from 'https://www.npmjs.com/package/react-google-autocomplete'
    // destructure ref from useplaceswidget hook to get input ref
    const { ref: locationInputRef } = usePlacesWidget({
        apiKey: import.meta.env.VITE_GOOGLE_PLACES_API_KEY,
        onPlaceSelected: (place) => {
            // update formdata if valid location is selected
            if (place && place.formatted_address) {
                setFormData((fData) => ({
                    ...fData,
                    location: place.formatted_address // set new location
                }))
                setError(null);
            }
        },
        options: {
            types: ['(cities)'],
            componentRestrictions: { country: 'us' }
        } // restrict to cities in us
    })

    // populate formdata whenever curr user changes
    useEffect(() => {
        if (currUser) {
            setFormData({
                username: currUser.username || '',
                firstName: currUser.firstName || '',
                lastName: currUser.lastName || '',
                email: currUser.email || '',
                birthDate: currUser.birthDate || '',
                location: currUser.location || '',
                bio: currUser.bio || '',
                profilePic: null,
                password: ''
            });
            setPicPreview(getProfilePic(currUser.profilePic));
        }
    }, [currUser]);

    // handle form input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((fData) => ({
            ...fData,
            [name]: value,
        }));
        setError(null);
    };

    // handle new profile picture upload
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData((fData) => ({
                ...fData,
                profilePic: file,
            }));
            setPicPreview(URL.createObjectURL(file));
        }
    };

    // handle resetting pic to default
    const handleResetPic = () => {
        setFormData((fData) => ({
            ...fData,
            profilePic: null, // clear profile pic
            resetProfilePic: 'true'// set true for backend to remove image
        }));
        setPicPreview(getProfilePic(null));
    }

    // handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const formDataToSend = new FormData();

            // append all valid fields
            for (const [key, value] of Object.entries(formData)) {
                if (value !== undefined && value !== null) {
                    formDataToSend.append(key, value);
                }
            }

            // send the data to the backend
            const updatedUser = await Api.updateUser(formData.username, formDataToSend);

            // update the current users state
            setCurrUser((prevUser) => ({
                ...prevUser,
                ...updatedUser,
            }));

            navigate('/profile');
        } catch (err) {
            setError(err.message);

            setLoading(false);
        }
    };

    if (loading) return <Loading />;

    return (
        <div className="FormContainer ProfileForm">
            <h1>Update Your Profile</h1>
            <form onSubmit={handleSubmit} encType="multipart/form-data">

                {/* display error if exists */}
                {error && <p className="form-error">{error}</p>}

                {/* profile pic preview */}
                <div className="form-group">
                    <label>Current Profile Picture</label>
                    <div className="pic-preview">
                        <img
                            src={picPreview}
                            alt="Profile Pic Preview"
                            width="150"
                            height="150"
                        />
                    </div>
                </div>

                {/* change profile pic input */}
                <div className="form-group">
                    <label htmlFor="profilePic">Change Profile Picture</label>
                    <input
                        type="file"
                        name="profilePic"
                        id="profilePic"
                        onChange={handleFileChange}
                    />
                </div>

                {/* reset profile pic */}
                <div className="form-group">
                    <button
                        type="button"
                        className="reset-pic"
                        onClick={handleResetPic}>
                        Reset Profile Picture
                    </button>
                </div>

                {/* username (read only) */}
                <div className="form-group">
                    <label htmlFor="username">Username</label>
                    <input
                        type="text"
                        name="username"
                        id="username"
                        defaultValue={formData.username}
                        autoComplete="username"
                        disabled
                    />
                </div>

                {/* first name */}
                <div className="form-group">
                    <label htmlFor="firstName">First Name</label>
                    <input
                        type="text"
                        name="firstName"
                        id="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        required
                    />
                </div>

                {/* last name */}
                <div className="form-group">
                    <label htmlFor="lastName">Last Name</label>
                    <input
                        type="text"
                        name="lastName"
                        id="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        required
                    />
                </div>

                {/* email */}
                <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input
                        type="email"
                        name="email"
                        id="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                </div>

                {/* birth date */}
                <div className="form-group">
                    <label htmlFor="birthDate">Birth Date</label>
                    <input
                        type="date"
                        name="birthDate"
                        id="birthDate"
                        value={formData.birthDate}
                        disabled
                    />
                </div>

                {/* location input with autocomplete */}
                <div className="form-group">
                    <label htmlFor="location">Location</label>
                    <input
                        ref={locationInputRef} // use input ref
                        type="text"
                        id="location"
                        placeholder="Type a city"
                        defaultValue={formData.location}
                        required
                    />
                </div>

                {/* bio */}
                <div className="form-group">
                    <label htmlFor="bio">Bio</label>
                    <textarea
                        name="bio"
                        id="bio"
                        value={formData.bio}
                        onChange={handleChange}
                        placeholder="Tell us about yourself"
                    />
                </div>

                {/* password */}
                <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <input
                        type="password"
                        name="password"
                        id="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Enter password to confirm changes"
                        autoComplete="current-password"
                        required
                    />
                </div>

                <div className="form-actions">
                    <button type="submit" className="profile-btn">Save Changes</button>
                    <button
                        type="button"
                        className="cancel-btn"
                        onClick={() => navigate('/profile')}
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ProfileForm;
