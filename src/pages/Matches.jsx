import { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Api from '../helpers/api';
import UserContext from '../context/UserContext';
import getProfilePic from '../helpers/getProfilePic';
import Loading from '../components/Loading';
import '../styles/Matches.css';

import noMatches from '../assets/placeholders/no_matches.png';

/** component for fetching list of compatible matches
 *
 * if no mbti is set for curr user, links user to quiz
*/

const Matches = () => {
    const { currUser, loading } = useContext(UserContext);
    const navigate = useNavigate();

    const [matches, setMatches] = useState(null);
    const [error, setError] = useState(null);

    // fetch matches on mount or curr user changes
    useEffect(() => {
        const fetchMatches = async () => {
            if (!currUser?.mbti) {
                setMatches([]); // no mbti no matches
                return;
            }

            try {
                const fetchedMatches = await Api.getMatches(currUser.username);
                setMatches(fetchedMatches);
            } catch (err) {
                setError(err.message)
            }
        };

        fetchMatches();
    }, [currUser]);

    if (error) return <p className="error">{error}</p>
    if (loading || matches == null) {
        return <Loading />;
    }
    // redirect to quiz if no mbti set
    if (!currUser || !currUser.mbti) {
        return (
            <div className="matches-prompt" data-aos="fade-up">
                <h1>Have you taken the quiz?</h1>
                <p>Discover your MBTI personality type by completing a quick 30-question quiz. Start now and gain insights into your unique personality traits</p>
                <Link to="/quiz" className="quiz-btn">
                    Take the Quiz
                </Link>
            </div>
        );
    }

    // handle clicking on matched users profile
    const handleViewProfile = (username) => {
        navigate(`/profile/${username}`);
    };

    return (
        <div className="Matches">
            <h2>Compatible Matches</h2>
            {matches.length > 0 ? (
                <div className="cards" data-aos="fade-up">
                    {matches.map((user) => (
                        <div key={user.username} className="card">
                            {/* matched users profile card */}
                            <h3 className="user-info">
                                <span>{user.firstName} {user.lastName}</span>
                                <span className="mbti">{user.mbti}</span>
                            </h3>
                            <hr></hr>
                            <div className="view-profile">
                                <img
                                    src={getProfilePic(user.profilePic)}
                                    alt={`${user.firstName} ${user.lastName}`}
                                    className="profile-pic"
                                    loading="lazy"
                                />
                                <button onClick={() => handleViewProfile(user.username)}>View Profile</button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                // if no matches
                <img className="no-matches" src={noMatches} alt="No Matches" />
            )}
        </div>
    );
};

export default Matches;
