import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import UserContext from '../context/UserContext';
import Loading from '../components/Loading';
import '../styles/Forms.css';

const LoginForm = () => {
    const { login } = useContext(UserContext);
    const navigate = useNavigate();

    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });

    // handle form input change
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((fData) => ({
            ...fData,
            [name]: value
        }));
    }

    // handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true); // spinner

        try {
            await login(formData);
            navigate('/'); // redirect to home
        } catch (err) {
            setError(err.message)
            setLoading(false)
        }
    }

    if (loading) return <Loading />

    return (
        <div className="FormContainer LoginForm">
            <h1>Log In</h1>
            <form onSubmit={handleSubmit}
                autoComplete="off">

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
                        autoComplete="current-username"
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
                        autoComplete="current-password"
                        required />
                </div>

                {/* error msg if exists */}
                {error && <p className="form-error">{error}</p>}
                <button type="submit" className="login-btn">Log In</button>
            </form>

            {/* sign up link */}
            <p className="signup-link">
                New user? <Link to="/signup">Create an account</Link>
            </p>
        </div>
    )
}

export default LoginForm;