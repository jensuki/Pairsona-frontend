import { useState, useEffect, useContext, useRef } from 'react';
import { useParams } from 'react-router-dom';
import Api from '../helpers/api';
import UserContext from '../context/UserContext';
import '../styles/Messages.css';

const Messages = () => {
    const { username } = useParams();
    const { currUser, loading, checkNotifications } = useContext(UserContext);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [error, setError] = useState(null);
    const messageHistoryRef = useRef(null); // ref for msg history container

    // scroll to recent msg
    const scrollToLatest = () => {
        if (messageHistoryRef.current) {
            messageHistoryRef.current.scrollTop = messageHistoryRef.current.scrollHeight;
        }
    }

    // fetch message history on mount
    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const res = await Api.getMessages(username);
                setMessages(res);

                // mark all messages as read
                for (let msg of res) {
                    if (!msg.is_read && msg.recipient_id === currUser.id) {
                        await Api.markMessageAsRead(msg.id);
                    }
                }
                // refresh notifications after marking messages as read
                checkNotifications();
                scrollToLatest();
            } catch (err) {
                setError(err.message || 'Error fetching messages');
            }
        };

        fetchMessages();
    }, [username, currUser, checkNotifications]);

    // scroll to bottom whenever messages are updated
    useEffect(() => {
        scrollToLatest();
    }, [messages]);

    // handle sending a new message
    const handleSendMessage = async (e) => {
        e.preventDefault();
        setError(null); // Clear previous errors

        try {
            const res = await Api.sendMessage(username, newMessage);

            if (!res) {
                return; // let global token expiration handler manage redirection/toast
            }

            setMessages([...messages, res.message]); // append new msg
            setNewMessage('');
        } catch (err) {
            console.error('Error sending message:', err);
            setError(err.message || 'Error sending message');
        }
    };

    if (loading) return <p>Loading...</p>;

    return (
        <div className="Messages">
            <h2>Chat with {username}</h2>
            <div className="message-history" ref={messageHistoryRef}>
                {/* render messages with separate 'sent' and 'received' classes */}
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`message ${currUser.id && msg.sender_id === currUser.id ? 'sent' : 'received'
                            }`}>
                        <p>{msg.content}</p>
                        <small>{new Date(msg.created_at).toLocaleString()}</small>
                    </div>
                ))}
            </div>
            <form onSubmit={handleSendMessage}>
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    required
                />
                <button type="submit">Send</button>
                {error && <p className="error" role="alert">{error}</p>}
            </form>
        </div>
    );
};

export default Messages;
