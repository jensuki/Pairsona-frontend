import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

export const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:3001';

/** static Api class for interacting with the backend api*/

class Api {
    // token saved here
    static token;
    static isExpired = false; // track token expiry globally for requests

    // axios instance
    static axiosInstance = axios.create({
        baseURL: BASE_URL
    });

    /** add an interceptor for handling 401 errors globally */
    static setupInterceptor(handleExpiredToken) {
        this.axiosInstance.interceptors.response.use(
            (response) => response,
            (error) => {
                // exclude login request from triggering token expiry toast
                if (error.response?.status === 401 && error.config.url !== 'auth/token') {
                    // console.log('401 Unauthorized detected by interceptor.');
                    handleExpiredToken();
                }
                return Promise.reject(error);
            }
        );
    }

    /** helper function to make api requests */
    static async request(endpoint, data = {}, method = 'get') {
        // always check token status before each requset
        if (this.token && this.isTokenExpired()) {
            this.clearToken();
        }

        const headers = {};
        if (this.token) {
            headers.Authorization = `Bearer ${this.token}`;
        }

        // FormData vs JSON
        if (data instanceof FormData) {
            // do nothing , axios will set headers for formData
        } else if (method !== 'get') {
            headers['Content-Type'] = 'application/json'; // set for non-get requests
            data = JSON.stringify(data);
        }

        try {
            const response = await this.axiosInstance({
                url: `${BASE_URL}/${endpoint}`,
                method,
                headers,
                params: method === 'get' ? data : {},
                data: method !== 'get' ? data : {}
            });
            return response.data;
        } catch (err) {
            console.error('API Request Error:', err.response);
            throw err.response?.data?.error || 'API request failed';
        }
    }

    /* tokens */

    static setToken(token) {
        this.token = token;
        localStorage.setItem('token', token);
    }

    static loadToken() {
        this.token = localStorage.getItem('token');
        if (this.isTokenExpired()) {
            this.clearToken();
        }
    }

    static clearToken() {
        this.token = null;
        this.isExpired = false; // reset expiration status
        localStorage.removeItem('token');
    }

    // helper func to check jwt token expiration
    static isTokenExpired() {
        if (!this.token) return true; // no token = expired
        try {
            const { exp } = jwtDecode(this.token);
            return exp * 1000 < Date.now(); // compare with current time
        } catch (err) {
            console.error('Error decoding token:', err);
            return true; // treat decoding errors as expired
        }
    }

    /* user + auth methods */

    static async login(data) {
        const res = await this.request('auth/token', data, 'post');
        this.setToken(res.token);
        return res.token;

    }
    static async register(formData) {
        try {
            const res = await this.request('auth/register', formData, 'post');
            if (res.token) {
                this.setToken(res.token); // Save token after registration
            }
            return res.token;
        } catch (err) {
            console.error('Register error:', err);
            throw err;
        }
    }


    static async getCurrentUser() {
        const res = await this.request('auth/me');
        return res.user;
    }

    static async updateUser(username, data) {
        try {
            const endpoint = `users/${username}`;
            const res = await this.request(endpoint, data, 'patch');
            return res.user; // return updated user data
        } catch (err) {
            console.error('Update User error:', err);
            throw err;
        }
    }

    static async deleteUser(username) {
        const res = await this.request(`users/${username}`, {}, 'delete');
        return res.deleted;
    }

    static async getMbtiDetails(username) {
        const res = await this.request(`users/${username}/mbti`);
        return res.mbtiDetails;
    }

    static async getMatches(username) {
        const res = await this.request(`users/${username}/matches?timestamp=${Date.now()}`);
        return res.matches;
    }

    // view matched users profile
    static async getUserProfile(username) {
        const res = await this.request(`users/${username}/profile`);
        return res.user;
    }

    /* quiz methods */

    static async getQuestions() {
        const res = await this.request('quiz/questions');
        return res;
    }

    static async submitQuiz(data) {
        const res = await this.request('quiz/results', data, 'post');
        return res;
    }

    /* connection methods */

    static async sendConnectionRequest(username) {
        const res = await this.request(`connections/${username}/connect`, {}, 'post');
        return res;
    }

    static async acceptConnectionRequest(connectionId) {
        return await this.request(`connections/${connectionId}/accept`, {}, 'post');
    }

    static async cancelConnectionRequest(connectionId) {
        const res = await this.request(`connections/${connectionId}/cancel-request`, {}, 'delete');
        return res;
    }

    static async declineConnectionRequest(connectionId) {
        return await this.request(`connections/${connectionId}/decline-request`, {}, 'delete');
    }

    static async getSentRequests() {
        const res = await this.request('connections/sent-requests');
        return res.data;
    }

    static async getPendingRequests() {
        const res = await this.request('connections/pending-requests');
        return res.requests;
    }

    static async getConnections() {
        const res = await this.request('connections');
        return res.connections;
    }

    static async markRequestAsRead() {
        return await this.request('connections/requests/read', {}, 'patch');
    }

    static async removeConnection(connectionId) {
        return await this.request(`connections/${connectionId}/disconnect`, {}, 'delete');
    }

    /* message methods */

    static async sendMessage(username, content) {
        return await this.request(`messages/${username}`, { content }, 'post');
    }

    static async getMessages(username) {
        const res = await this.request(`messages/${username}`);
        return res.messages;
    }

    static async getUnreadMessages() {
        const res = await this.request('messages/unread');
        return res.messages;
    }

    static async hasUnreadMessages() {
        const res = await this.request('messages/unread');
        return res.messages.length > 0;
    }

    static async markMessageAsRead(messageId) {
        const res = await this.request(`messages/${messageId}/read`, {}, 'patch');
        return res.message;
    }
}

Api.loadToken(); // load token on app start;

export default Api;
