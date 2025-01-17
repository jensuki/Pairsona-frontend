import { Navigate } from 'react-router-dom';
import { useContext } from 'react';
import UserContext from '../context/UserContext';

// eslint-disable-next-line react/prop-types
const PrivateRoute = ({ children }) => {
    const { currUser } = useContext(UserContext);

    return currUser ? children : <Navigate to="/login" replace />;
};

export default PrivateRoute;
