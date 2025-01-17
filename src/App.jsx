import { useEffect } from 'react';
import Navbar from './components/Navbar';
import { UserProvider } from './context/UserContext';
import AppRoutes from './Routes';
import useAuth from './hooks/useAuth';
import useNotifications from './hooks/useNotifications';
import Loading from './components/Loading'
import AOS from 'aos';
import 'aos/dist/aos.css'; // aos styles
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './styles/App.css';

/** main app comopnent for pairsona */

const App = () => {
  const {
    currUser,
    setCurrUser,
    token,
    signup,
    login,
    logout,
    loading
  } = useAuth();

  const {
    hasNotifications,
    hasNewMessages,
    checkNotifications
  } = useNotifications(currUser);


  // initialize aos once on app load
  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
    });
  }, []);

  // display loading spinner while fetching user data
  if (loading) return <Loading />

  return (
    <div className="App">
      <ToastContainer
        position="top-center" />
      <UserProvider
        value={{
          currUser,
          setCurrUser,
          token,
          signup,
          login,
          logout,
          loading,
          hasNotifications,
          hasNewMessages,
          checkNotifications,
        }}
      >
        <Navbar
          currUser={currUser}
          logout={logout}
          hasNotifications={hasNotifications}
          hasNewMessages={hasNewMessages}
        />
        <AppRoutes currUser={currUser} signup={signup} login={login} />
      </UserProvider>
    </div>
  );
};

export default App;
