import { describe, expect, test } from 'vitest';
import getProfilePic from '../helpers/getProfilePic';

describe('getProfilePic helper', () => {
    test('returns the provided profilePicUrl', () => {
        const result = getProfilePic('/images/user1.png');
        expect(result).toBe('/images/user1.png');
    });

    test('returns default profile picture when profilePicUrl is null', () => {
        const result = getProfilePic(null);
        expect(result).toBe('/assets/default_pic.png');
    });

    test('returns default profile picture when profilePicUrl is undefined', () => {
        const result = getProfilePic(undefined);
        expect(result).toBe('/assets/default_pic.png');
    });
});
