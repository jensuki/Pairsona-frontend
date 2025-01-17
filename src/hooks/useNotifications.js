import { useState, useEffect, useCallback } from 'react';
import Api from '../helpers/api';

/** hook to handle notifications and message status globally */

const useNotifications = (currUser) => {
    const [hasNotifications, setHasNotifications] = useState(false);
    const [hasNewMessages, setHasNewMessages] = useState([]);

    // fetch notifications and messages
    const checkNotifications = useCallback(async () => {
        if (!currUser || Api.isTokenExpired()) return;

        try {
            const [pendingRequests, unreadMessages] = await Promise.all([
                Api.getPendingRequests(currUser.username), // Fetch pending requests
                Api.getUnreadMessages(), // Fetch unread messages
            ]);

            setHasNotifications(pendingRequests.length > 0); // update notification state
            setHasNewMessages(unreadMessages.map((msg) => msg.sender_username)); // map unread messages to usernames
        } catch (err) {
            console.error('Error checking notifications:', err.message || err);
        }
    }, [currUser]);

    // automatically check notifications when the curr user changes
    useEffect(() => {
        if (currUser) {
            checkNotifications();
        }
    }, [currUser, checkNotifications]);

    return {
        hasNotifications,
        hasNewMessages,
        checkNotifications
    };
};

export default useNotifications;
