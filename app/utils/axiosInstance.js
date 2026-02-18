// axiosConfig.js
import axios from 'axios';

// Create an Axios instance
const axiosInstance = axios.create({
    baseURL: 'https://stoic-quotes.com/api',
    timeout: 10000,
});

// Add a request interceptor
axiosInstance.interceptors.request.use(async (config) => {
    // Create a trace for the request
    return config;
}, (error) => {
    return Promise.reject(error);
});

// Add a response interceptor
axiosInstance.interceptors.response.use(async (response) => {
    return response;
}, async (error) => {
    return Promise.reject(error);
});

export default axiosInstance;