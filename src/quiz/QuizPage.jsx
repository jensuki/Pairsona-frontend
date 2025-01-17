import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import Api from '../helpers/api';
import UserContext from '../context/UserContext';
import Loading from '../components/Loading';
import '../styles/QuizPage.css';

const QuizPage = () => {
    const { currUser, setCurrUser, loading } = useContext(UserContext);
    const [questions, setQuestions] = useState(null);
    const [answers, setAnswers] = useState({}); // track answers
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0); // track current question
    const [error, setError] = useState(null);

    const navigate = useNavigate();

    // fetch questions from the backend
    useEffect(() => {
        const fetchQuestions = async () => {
            if (!currUser) {
                // navigate('/login');
                return;
            }

            try {
                const res = await Api.getQuestions();
                setQuestions(res);
            } catch (err) {
                setError(err.message)
            }
        };

        fetchQuestions();
    }, [currUser, navigate]);

    // handle answering a question
    const handleAnswer = (questionId, value) => {
        setAnswers({
            ...answers,
            [questionId]: value
        });
    };

    // go to the next question
    const handleNext = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        }
    };

    // go back to previous question
    const handlePrevious = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(currentQuestionIndex - 1);
        }
    };

    // submit quiz
    const handleSubmit = async () => {
        try {
            // submit answers
            const res = await Api.submitQuiz({ answers });

            // update the currUser context with the new MBTI result
            setCurrUser((user) => ({
                ...user,
                mbti: res.type,
            }));

            // navigate to results
            navigate('/results');
        } catch (err) {
            setError(err.message)
        }
    };

    if (error) return <p className="error">{error}</p>
    if (loading || questions === null) {
        return <Loading />
    }

    // track current question
    const currentQuestion = questions[currentQuestionIndex];

    // calculate progress as a percentage
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

    return (
        <div className="QuizPage">
            {/* progress bar */}
            <div className="progress-bar-container">
                <div className="progress-bar" style={{ width: `${progress}%` }}></div>
            </div>

            {/* display current question */}
            <div className="question-container">
                <h4>{currentQuestion.text}</h4>
                <div className="options-container">
                    {currentQuestion.options.map((option) => (
                        // left and right options
                        <label key={option.value} className="option" >
                            <input
                                type="radio"
                                name={currentQuestion.id}
                                value={option.value}
                                onChange={() => handleAnswer(currentQuestion.id, option.value)}
                                checked={answers[currentQuestion.id] === option.value}
                                aria-label={option.text} // add for test accessibility
                            />
                            <span>{option.text}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* navigation buttons */}
            <div className="navigation-buttons">
                {currentQuestionIndex > 0 && (
                    <button
                        className="nav-button"
                        onClick={handlePrevious}
                        aria-label="Previous question">
                        <i className="fas fa-arrow-left fa-2x"></i>
                    </button>
                )}
                {currentQuestionIndex < questions.length - 1 ? (
                    <button
                        className="nav-button"
                        onClick={handleNext}
                        disabled={!answers[currentQuestion.id]}
                        aria-label="Next question">
                        <i className="fas fa-arrow-right fa-2x"></i>
                    </button>
                ) : (
                    answers[currentQuestion.id] && (
                        <button className="submit-button" onClick={handleSubmit}>
                            Submit
                        </button>
                    )
                )}
            </div>
        </div >
    );
};

export default QuizPage;
