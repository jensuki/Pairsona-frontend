import { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Api from '../helpers/api';
import UserContext from '../context/UserContext';
import getProfilePic from '../helpers/getProfilePic';
import Loading from '../components/Loading';
import noConnections from '../assets/placeholders/no_connections.png';
import '../styles/Connections.css';

/** component for displaying list of all connected users */

const ConnectedUsers = () => {
    const { currUser, hasNewMessages, checkNotifications, loading } = useContext(UserContext);
    const navigate = useNavigate();

    const [connections, setConnections] = useState(null);
    const [error, setError] = useState(null);

    // fetch connections whenever curr user or notifications change
    useEffect(() => {
        if (!currUser) return;

        const fetchConnections = async () => {
            try {
                const res = await Api.getConnections();
                setConnections(res || []); // update state with response
                checkNotifications();
            } catch (err) {
                setError(err.message);
            }
        };

        fetchConnections();
    }, [currUser, checkNotifications]);


    // handle removing a connection
    const handleRemoveConnection = async (connectionId) => {
        try {
            // proceed with removal
            await Api.removeConnection(connectionId);

            // update connection list after removal
            setConnections((prevConnections) =>
                prevConnections.filter(conn => conn.connectionId !== connectionId)
            );
            // refresh notifications immediately
            checkNotifications();
        } catch (err) {
            setError(err.message);
        }
    };

    // handle navigating to messaging page
    const handleSendMessage = (username) => {
        navigate(`/messages/${username}`);
    };

    if (error) {
        return <p className="error">{error}</p>;
    }

    if (loading || connections === null) {
        return <Loading />;
    }

    return (
        <div className="ConnectedUsers">
            <h2>Your Connections</h2>

            {connections.length === 0 && <img src={noConnections} />}

            <ul className="connections-list">
                {connections.map(conn => {
                    return (
                        <li key={conn.connectionId} className="connection-item">
                            {/* connection list */}
                            <div className="connection-info">
                                <img
                                    src={getProfilePic(conn.profilePic)}
                                    alt={`${conn.firstName} ${conn.lastName}`}
                                    className="profile-pic"
                                    loading="lazy"
                                />
                                <div className="user-details">
                                    <Link to={`/profile/${conn.username}`} className="user-name">
                                        {conn.firstName} {conn.lastName}
                                    </Link>
                                    {hasNewMessages.includes(conn.username.toLowerCase()) && (
                                        <span className="notification-dot"></span>
                                    )}
                                </div>
                            </div>
                            <div className="connection-actions">
                                <button className="chat-btn" onClick={() => handleSendMessage(conn.username)}>
                                    Chat with {conn.firstName}
                                </button>
                                <button className="remove-btn" onClick={() => handleRemoveConnection(conn.connectionId)}>
                                    Remove
                                </button>
                            </div>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};

export default ConnectedUsers;
