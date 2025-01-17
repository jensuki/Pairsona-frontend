import { useContext, useEffect, useState } from "react";
import { useNavigate, Link } from 'react-router-dom';
import Api from '../helpers/api';
import UserContext from '../context/UserContext';
import Loading from '../components/Loading';
import noRequests from '../assets/placeholders/no_requests.png';
import '../styles/Connections.css';


const PendingRequests = () => {
    const { currUser, checkNotifications } = useContext(UserContext);
    const navigate = useNavigate();

    const [pendingRequests, setPendingRequests] = useState([]);
    const [loading, setLoading] = useState(true); // use local loading
    const [error, setError] = useState(null);

    // fetch pending requests whenever curr user changes
    useEffect(() => {
        if (!currUser) {
            setPendingRequests([]); // clear the list if the user logs out
            setLoading(false);
            return;
        }

        const fetchPendingRequests = async () => {
            try {
                setLoading(true);
                const res = await Api.getPendingRequests();
                setPendingRequests(res);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchPendingRequests();
    }, [currUser]);

    // handle accepting a connection request
    const handleAccept = async (connectionId) => {
        try {
            await Api.acceptConnectionRequest(connectionId);

            // remove conn request with given id from pending requests
            setPendingRequests((prev) =>
                prev.filter((req) => req.connectionId !== connectionId)
            );

            // redirect after accepting
            navigate('/connections');
        } catch (err) {
            setError(err.message);
        }
    };

    // handle declining a connection request
    const handleDecline = async (connectionId) => {
        try {
            await Api.declineConnectionRequest(connectionId);

            // remove declined request from the pending list
            setPendingRequests(pendingRequests.filter(req => req.connectionId !== connectionId));

            // refresh notifications immediately
            checkNotifications();
        } catch (err) {
            setError(err.message);
        }
    };

    if (error) return <p className="error">{error}</p>
    if (loading) return <Loading />

    return (
        <div className="PendingRequests">
            <h2>Connection Requests</h2>
            {pendingRequests.length === 0 ? (
                <img src={noRequests} alt="No Requests" />
            ) : (
                <ul className="pending-requests-list">
                    {pendingRequests.map((req) => (
                        <li key={req.connectionId} className="pending-request-item">
                            <div className="request-info">
                                <Link to={`/profile/${req.username}`} className="requester-name">
                                    <strong>{req.firstName} {req.lastName}</strong>
                                </Link>
                                <span> wants to connect with you</span>
                            </div>
                            {/* accept or decline buttons */}
                            <div className="request-actions">
                                <button className="accept-btn" onClick={() => handleAccept(req.connectionId)}>
                                    Accept
                                </button>
                                <button className="decline-btn" onClick={() => handleDecline(req.connectionId)}>
                                    Decline
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            )
            }
        </div >
    );
};

export default PendingRequests;
