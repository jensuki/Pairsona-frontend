import { useState, useEffect, useContext } from 'react';
import Api from '../helpers/api';
import UserContext from '../context/UserContext';
import Loading from '../components/Loading';
import '../styles/Results.css';

const Results = () => {
    const { currUser } = useContext(UserContext);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true); // use local state

    useEffect(() => {
        const fetchResult = async () => {
            try {
                const data = await Api.getMbtiDetails(currUser.username);
                setResult(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchResult();
    }, [currUser]);

    if (loading) return <Loading />
    if (error) return <div className="error">{error}</div>;
    if (!result) return <div>No results available. Please take the quiz.</div>;

    return (
        <div className="ResultsPage">
            <div className="results-container">
                {/* quiz results */}
                <h2>Your result:</h2>
                <h3><strong>{result.type}</strong></h3>
                <h4>{result.title}</h4>
                <p>Percentage of Population: {result.percentage}</p>
                <p className="result-desc">{result.description}</p>
                <a href={result.site} target="_blank" rel="noreferrer">
                    Learn more about {result.type}
                </a>
            </div>
        </div>
    );
};

export default Results;
