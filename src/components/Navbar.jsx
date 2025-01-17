import { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import UserContext from '../context/UserContext';
import Api from '../helpers/api';
import pairsonaLogo from '../assets/logos/pairsona_logo.png';
import '../styles/Navbar.css';

/** navbar component
 *
 * displays nav links for pairona
 * conditionally displayed links based on currUser stte
 * show notifications for requests and unread messages for logged in user
*/

const Navbar = () => {
    const {
        currUser,
        logout,
        hasNotifications,
        hasNewMessages,
    } = useContext(UserContext);
    const navigate = useNavigate();

    // handle logo click
    const handleLogoClick = (e) => {
        e.preventDefault();
        if (!currUser || Api.isTokenExpired()) {
            logout();
            navigate('/');
        } else {
            navigate('/');
        }
    };

    return (
        <nav className="Navbar">

            {/* brand logo */}
            <div className="Navbar-brand">
                <a href="/" onClick={handleLogoClick} aria-label="Home">
                    <img src={pairsonaLogo} className="Navbar-logo" alt="Pairsona-Logo" />
                </a>
            </div>

            {/* nav links */}
            {currUser ? (
                <ul className="Navbar-links">
                    {/* link to curr user's profile */}
                    <li className="nav-item">
                        <NavLink
                            to="/profile"
                            aria-label="View Profile"
                            // apply 'active' class only when viewing curr users profile
                            className={({ isActive }) =>
                                isActive && location.pathname === '/profile' ? 'active' : ''}
                        >
                            {currUser.firstName}
                        </NavLink>
                    </li>

                    {/* link to find matches */}
                    <li className="nav-item">
                        <NavLink
                            to="/matches"
                            aria-label="Find Matches">
                            Find Matches
                        </NavLink>
                    </li>

                    {/* notification link with indicator */}
                    <li className="nav-item">
                        <NavLink to="/requests" aria-label="View Notifications">
                            Notifications
                            {hasNotifications && <span className="notification-dot"></span>}
                        </NavLink>
                    </li>

                    {/* connections link with unread message indicator */}
                    <li className="nav-item">
                        <NavLink to="/connections" aria-label="View Connections">
                            Connections
                            {hasNewMessages.length > 0 && <span className="notification-dot"></span>}
                        </NavLink>
                    </li>

                    {/* logout button */}
                    <li className="nav-item">
                        <button onClick={logout} className="logout-btn">
                            Log Out
                        </button>
                    </li>
                </ul>
            ) : (
                <ul className="Navbar-links">
                    {/* public links for users not logged in */}
                    <li className="nav-item">
                        <NavLink to="/login">Login</NavLink>
                    </li>
                    <li className="nav-item">
                        <NavLink to="/signup">Sign Up</NavLink>
                    </li>
                </ul>
            )}
        </nav>
    )
}

export default Navbar;