import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Api from '../helpers/api';

/** hook to handle auth related tasks */

const useAuth = () => {
    const [currUser, setCurrUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token') || null);
    const [loading, setLoading] = useState(true);

    // clear user data and navigate to login
    const handleExpiredToken = () => {
        // console.log('session expired!');
        setCurrUser(null);
        setToken(null);
        Api.clearToken();

        // prevent multiple toast alerts
        if (!Api.isExpired) {
            Api.isExpired = true;
            toast.error('Your session has expired. Please log in again.', {
                position: "top-center",
                autoClose: 2000,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                theme: 'colored',
            });
            // let private route handle redirect to login
        }
    };

    // set up interceptors on mount to deal with token expiry
    useEffect(() => {
        Api.setupInterceptor(handleExpiredToken);
    }, []);

    // fetch user data when token changes
    useEffect(() => {
        const fetchUser = async () => {
            setLoading(true)
            if (!token) {
                setLoading(false);
                return;
            }
            try {
                Api.setToken(token); // set token globally

                // check if token is expired
                if (Api.isTokenExpired()) {
                    handleExpiredToken();
                    return;
                }
                const user = await Api.getCurrentUser();
                setCurrUser(user);
            } catch (err) {
                console.error('Failed to fetch user:', err.message || err);
                handleExpiredToken();
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, [token]);

    // handle user signup
    const signup = async (formData) => {
        try {
            const token = await Api.register(formData);
            if (token) {
                Api.setToken(token);
                setToken(token);
                localStorage.setItem('username', formData.username);
                const user = await Api.getCurrentUser(); // fetch user
                setCurrUser(user);
            }
        } catch (err) {
            console.error('Signup failed:', err.message || err);
            throw err;
        }
    };

    // handle user login
    const login = async ({ username, password }) => {
        try {
            const token = await Api.login({ username, password }); // call api to login
            setToken(token);
            localStorage.setItem('token', token);
            localStorage.setItem('username', username);
        } catch (err) {
            console.error('Login failed:', err.message || err);
            throw err;
        }
    };

    // handle user logout
    const logout = () => {
        setCurrUser(null);
        setToken(null);
        Api.clearToken();
        Api.isExpired = false; // reset globally
        localStorage.removeItem('token');
        localStorage.removeItem('username');
    };

    return {
        currUser,
        setCurrUser,
        token,
        signup,
        login,
        logout,
        loading
    }
}

export default useAuth;