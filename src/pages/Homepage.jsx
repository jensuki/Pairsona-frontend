import { useContext } from 'react';
import { Link } from 'react-router-dom';
import UserContext from '../context/UserContext';
import Loading from '../components/Loading';

// home images
import home1 from '../assets/homepage/home1.png';
import home2 from '../assets/homepage/home2.png';
import home3 from '../assets/homepage/home3.png';
import home4 from '../assets/homepage/home4.png';
import home5 from '../assets/homepage/home5.png';
import pairsonalogoLg from '../assets/logos/pairsona_logo_large.png';

import '../styles/Homepage.css';

const Homepage = () => {
    const { currUser, loading } = useContext(UserContext);

    if (loading) return <Loading />

    return (
        <div className="Homepage">
            {currUser ? (
                <>
                    {/* hero section for logged in users */}
                    <section className="hero" data-aos="fade-up">
                        <h3><i>Welcome {currUser.firstName}</i></h3>

                        {/* mbti introduction */}
                        <h1>Understanding MBTI Compatibility</h1>
                        <p>MBTI (Myers-Briggs Type Indicator) compatibility is rooted in the idea that personality types with complementary traits or cognitive functions can create harmonious and enriching relationships.
                            Compatibility doesn&apos;t necessarily mean “same type” — in fact, many MBTI pairings thrive on balance and contrast, where ones strengths complement another&apos;s.</p>
                        <p>It&apos;s often about balance. Opposites attract, like <strong>Introverts (I)</strong> pairing with <strong>Extraverts (E)</strong>, or <strong>Judgers (J)</strong> balancing with <strong>Perceivers (P)</strong>.
                            Cognitive functions also play a role — types with complementary strengths can create deep, meaningful connections.</p>
                        <Link to="/matches" className="cta-button">Get Matched</Link>

                        <hr></hr>

                        <h2>Examples of Compatible Pairings</h2>
                        <div className="example-pairs">
                            <div className="pair">
                                <img src={home1} alt="Girl smiling with book" />
                                <p><strong>INFJs</strong> bring deep introspection, while <strong>ENFPs</strong> add vibrant creative energy, balancing intuition and feeling.</p>
                            </div>
                            <div className="pair">
                                <img src={home2} alt="Male sitting with book" />
                                <p>Organized <strong>ISTJs</strong> pair well with lively and adaptable <strong>ESFPs</strong>.</p>
                            </div>
                            <div className="pair">
                                <img src={home3} alt="Gardening person" />
                                <p><strong>ENTPs</strong> bring fresh ideas, while <strong>INTJs</strong> provide focus and strategy.</p>
                            </div>
                            <div className="pair">
                                <p><strong>ISFJs</strong> offer stability, while <strong>ESTPs</strong> bring excitement and spontaneity.</p>
                            </div>
                            <div className="pair">
                                <img src={home4} alt="Girl running with flag" />
                                <p><strong>ENFJs</strong> guide with warmth and vision, while <strong>INFPs</strong> bring deep values and empathy.</p>
                            </div>
                            <div className="pair">
                                <img src={home5} alt="Male Logistician" />
                                <p><strong>ENTJs</strong> lead with ambition and drive, while <strong>INTPs</strong> offer insight and problem-solving.</p>
                            </div>
                        </div>
                    </section>

                </>
            ) : (
                <>
                    {/* hero section for guests */}
                    <section className="hero" data-aos="fade-up">
                        <h1>Authentic Connections<br></br> For Every Journey</h1>
                        <p>Meet like-minded people who align with your personality and values. Whether it&apos;s love, friendship, or meaningful chats, your connections - your way.</p>
                        <Link to="/quiz" className="cta-button">Take your MBTI Personality Quiz</Link>
                        <img className="logo-lg" src={pairsonalogoLg} alt="Guests Home avatar" />
                    </section>

                    <hr></hr>

                    {/* how it works section */}
                    <section className="how-it-works" data-aos="fade-left">
                        <h2>How It Works</h2>
                        <div className="steps">
                            <div className="step">
                                <h3>1. Sign Up</h3>
                                <p>Create an account and join our community.</p>
                            </div>
                            <div className="step">
                                <h3>2. Take the Quiz</h3>
                                <p>Discover your MBTI type with our simple quiz.</p>
                            </div>
                            <div className="step">
                                <h3>3. Get Matched</h3>
                                <p>Find compatible people based on personality.</p>
                            </div>
                            <div className="step">
                                <h3>4. Connect</h3>
                                <p>Connect and get to know your matches through our chat!</p>
                            </div>
                        </div>
                    </section>

                    <hr></hr>

                    {/* features section */}
                    <section className="features" data-aos="fade-up">
                        <h2>Why Choose Us?</h2>
                        <ul>
                            <li><strong>Personality-Based Matches</strong> – We pair you based on MBTI compatibility.</li>
                            <li><strong>Flexible Connections</strong> – Looking for friends or something more? Your choice.</li>
                            <li><strong>Privacy-Focused</strong> – Your data, your control.</li>
                        </ul>
                    </section>
                    <hr></hr>

                    {/* testimonials */}
                    <section className="testimonials">
                        <blockquote>This app made it easy to connect with fellow introverts in a discreet and comfortable way.</blockquote>
                        <blockquote>A welcoming space with plenty of opportunities to form genuine friendships.</blockquote>
                    </section>

                    {/* cta section */}
                    <section className="final-cta">
                        <h2>Ready to meet your match?</h2>
                        <Link to="/signup" className="cta-button">Get Started</Link>
                        <p className="login-link">
                            Already have an account? <Link to="/login">Log in</Link>
                        </p>
                    </section>
                </>
            )}
        </div>
    )
}

export default Homepage;