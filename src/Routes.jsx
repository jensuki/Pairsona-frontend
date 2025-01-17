import { Routes, Route, Navigate } from 'react-router-dom';
import Homepage from './pages/Homepage';
import Matches from './pages/Matches';
import Messages from './pages/Messages';
import ProfileForm from './pages/ProfileForm';
import UserProfile from './pages/UserProfile';

import LoginForm from './auth/LoginForm';
import SignupForm from './auth/SignupForm';

import QuizPage from './quiz/QuizPage';
import Results from './quiz/Results';

import PendingRequests from './connections/PendingRequests';
import ConnectedUsers from './connections/ConnectedUsers';

import PrivateRoute from './components/PrivateRoute';

const AppRoutes = () => {
    return (
        <Routes>
            {/* public routes */}
            <Route path='/' element={<Homepage />} />
            <Route path='/login' element={<LoginForm />} />
            <Route path='/signup' element={<SignupForm />} />

            {/* private routes */}
            <Route
                path='/quiz'
                element={
                    <PrivateRoute>
                        <QuizPage />
                    </PrivateRoute>
                }
            />
            <Route
                path='/results'
                element={
                    <PrivateRoute>
                        <Results />
                    </PrivateRoute>
                }
            />
            <Route
                path='/profile/edit'
                element={
                    <PrivateRoute>
                        <ProfileForm />
                    </PrivateRoute>
                }
            />
            <Route
                path='/profile'
                element={
                    <PrivateRoute>
                        <UserProfile />
                    </PrivateRoute>
                }
            />
            <Route
                path='/profile/:username'
                element={
                    <PrivateRoute>
                        <UserProfile />
                    </PrivateRoute>
                }
            />
            <Route
                path='/requests'
                element={
                    <PrivateRoute>
                        <PendingRequests />
                    </PrivateRoute>
                }
            />
            <Route
                path='/connections'
                element={
                    <PrivateRoute>
                        <ConnectedUsers />
                    </PrivateRoute>
                }
            />
            <Route
                path='/matches'
                element={
                    <PrivateRoute>
                        <Matches />
                    </PrivateRoute>
                }
            />
            <Route
                path='/messages/:username'
                element={
                    <PrivateRoute>
                        <Messages />
                    </PrivateRoute>
                }
            />

            {/* catch-all route */}
            <Route path='*' element={<Navigate to='/' />} />
        </Routes>
    );
};

export default AppRoutes;
