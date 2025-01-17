/** mock data for frontend tests */

import { vi } from 'vitest';

const demoUser = {
    id: 1,
    username: 'testuser',
    firstName: 'Test',
    lastName: 'User',
    email: 'testuser@example.com',
    birthDate: '2000-01-01',
    bio: 'Loves personality tests',
    mbti: 'INFJ',
    location: 'New York, NY',
    profilePic: null,
};

const demoMatches = [
    {
        username: 'user1',
        firstName: 'User',
        lastName: 'One',
        mbti: 'ENFP',
        location: 'Brooklyn, NY',
        distance: 5, // in miles
        bio: 'Creative and full of energy',
        profilePic: null,
    },
    {
        username: 'user2',
        firstName: 'User',
        lastName: 'Two',
        mbti: 'ENTP',
        location: 'Jersey City, NJ',
        distance: 10,
        bio: 'Always brimming with new ideas',
        profilePic: null,
    },
];

const demoConnectionRequests = [
    {
        connectionId: 1,
        username: 'user1',
        firstName: 'User',
        lastName: 'One',
        sender: 'user1', // user1 sends request
        recipient: 'testuser', // testuser receives
        status: 'pending',
    },
];

const demoConnections = [
    {
        connectionId: 2,
        username: 'user3',
        firstName: 'User',
        lastName: 'Three',
        mbti: 'ISFJ',
        bio: 'Steady and dependable friend',
        profilePic: null,
    },
];

const demoNotifications = {
    hasNotifications: true,
    hasNewMessages: ['user3'], // only user3 has messages
    checkNotifications: vi.fn(),
};

export {
    demoUser,
    demoMatches,
    demoConnectionRequests,
    demoConnections,
    demoNotifications
};
