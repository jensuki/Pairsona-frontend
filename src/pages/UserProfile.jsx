import { useState, useEffect, useContext } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom';
import UserContext from '../context/UserContext';
import Api from '../helpers/api';
import getProfilePic from '../helpers/getProfilePic';
import Loading from '../components/Loading';
import '../styles/UserProfile.css';

/** component to display user profile cards for either:
 * - the current logged-in user
 * - another user's profile (based on URL parameter)
 *  includes functionality to handle connection requests (send, cancel, accept).
 */

const UserProfile = () => {
    const { username: paramUsername } = useParams(); // get username from url
    const { currUser } = useContext(UserContext);
    const navigate = useNavigate();

    const [user, setUser] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true); // use local state
    const [connectionStatus, setConnectionStatus] = useState({
        type: null, // 'sent' received' 'connected' or null
        connectionId: null
    });

    // determine which user profile to load
    const username = paramUsername || currUser?.username;

    // fetch user profile + connection status on mount
    useEffect(() => {

        const fetchUserData = async () => {
            try {
                setLoading(true); // start

                const fetchedUser = await Api.getUserProfile(username);
                if (!fetchedUser) {
                    setError('User not found');
                    return;
                }
                setUser(fetchedUser);

                // fetch connection data
                const [sentRequests, pendingRequests, confirmedConnections] = await Promise.all([
                    Api.getSentRequests(),
                    Api.getPendingRequests(),
                    Api.getConnections()
                ]);

                // determine if the current user sent a request to this profile
                const sent = sentRequests.find(req => req.username === fetchedUser.username);

                // determine if the current user received a request from this profile
                const received = pendingRequests.find(req => req.username === fetchedUser.username);

                // determine if the current user is already connected to this profile
                const connected = confirmedConnections.find(conn => conn.username === fetchedUser.username);

                // update connectionStatus based on: connected > received > sent > null
                if (connected) {
                    setConnectionStatus({
                        type: 'connected',
                        connectionId: connected.connectionId,
                    });
                } else if (received) {
                    setConnectionStatus({
                        type: 'received',
                        connectionId: received.connectionId,
                    });
                } else if (sent) {
                    setConnectionStatus({
                        type: 'sent',
                        connectionId: sent.connectionId,
                    });
                } else {
                    setConnectionStatus({
                        type: null,
                        connectionId: null,
                    });
                }
            } catch (err) {
                console.error(err);
                setError('Error fetching user data.');
            } finally {
                setLoading(false);
            }
        };
        fetchUserData();
    }, [username]);

    // handle sending or cancelling a connection request
    const handleConnectionRequest = async () => {
        try {
            setError(null);

            if (connectionStatus.type === 'sent') {
                // if 'sent' -> cancel request and set to null
                await Api.cancelConnectionRequest(connectionStatus.connectionId);
                setConnectionStatus({
                    type: null,
                    connectionId: null
                });
            } else {
                const res = await Api.sendConnectionRequest(username);
                setConnectionStatus({ type: 'sent', connectionId: res.data.id });
            }
        } catch (err) {
            setError(err.message || "Error sending or canceling request");
        }
    };

    // handle accepting a received connection request
    const handleAcceptRequest = async () => {
        try {
            setError(null);
            if (connectionStatus.type === 'received') {
                // accept the received connection request
                await Api.acceptConnectionRequest(connectionStatus.connectionId);
                setConnectionStatus({
                    type: 'connected',
                    connectionId: null
                });
                navigate('/connections'); // redirect to connections page
            }
        } catch (err) {
            setError(err.message || 'Error accepting connection request');
        }
    };

    if (loading) return <Loading />
    if (error) return <p className="error">{error}</p>

    return (
        <div className="UserProfile">

            {/* user profile card image */}
            <div className="card">
                <h1>{user.firstName} {user.lastName}</h1>
                <img
                    src={getProfilePic(user.profilePic)}
                    alt={`${user.firstName} ${user.lastName}`}
                    className="profile-pic"
                    loading="lazy"
                />
                <hr></hr>
                {/* user profile card details */}
                <p>
                    MBTI: <strong>{user.mbti || <Link to="/quiz">Go to quiz!</Link>}</strong>
                </p>
                <p>{new Date(user.birthDate).toLocaleDateString('en-US')}</p>
                <p>{user.location}</p>
                <p>{user.email}</p>
                {user.bio && <p><strong>Bio:</strong> {user.bio}</p>}

                {/* render buttons based on connection status*/}
                {currUser?.username !== user.username && (
                    <>
                        {connectionStatus.type === 'sent' && (
                            <button className="btn btn-cancel" onClick={handleConnectionRequest}>
                                Cancel Connection Request
                            </button>
                        )}
                        {connectionStatus.type === 'received' && (
                            <button className="btn btn-accept" onClick={handleAcceptRequest}>
                                Accept Connection Request
                            </button>
                        )}
                        {connectionStatus.type === 'connected' && (
                            <div className="connected-options">
                                <button className="btn btn-connected" disabled>
                                    Connected
                                </button>
                                <button className="btn btn-chat" onClick={() => navigate(`/messages/${username}`)}>
                                    Chat with {user.firstName}
                                </button>
                            </div>
                        )}
                        {connectionStatus.type === null && (
                            <button className="btn btn-connect" onClick={handleConnectionRequest}>
                                Connect with {username}
                            </button>
                        )}
                    </>
                )}
                {/* display edit profile button if curr user */}
                {currUser?.username === user.username && (
                    <Link to="/profile/edit">
                        <button>Edit Profile</button>
                    </Link>
                )}
            </div>
            {/* mbti information */}
            <div className="mbti-info" data-aos="fade-left">
                {user.mbtiDetails && (
                    <div className="card card-right">
                        <p><strong>{user.mbtiDetails.title}</strong></p>
                        <p>{user.mbtiDetails.description}</p>
                        <a href={user.mbtiDetails.site} target="_blank" rel="noreferrer">
                            Learn more about {user.mbti}
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
}

export default UserProfile;