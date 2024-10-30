// axiosConfig.js
import axios from 'axios';
import perf from '@react-native-firebase/perf';

// Create an Axios instance
const axiosInstance = axios.create({
    baseURL: 'https://stoic-quotes.com/api',
    timeout: 10000,
});

// Add a request interceptor
axiosInstance.interceptors.request.use(async (config) => {
    // Create a trace for the request
    const httpMetric = perf().newHttpMetric(config.url, config.method.toUpperCase());
    config.metadata = {httpMetric};

    await httpMetric.start();

    return config;
}, (error) => {
    return Promise.reject(error);
});

// Add a response interceptor
axiosInstance.interceptors.response.use(async (response) => {
    const {httpMetric} = response.config.metadata;

    httpMetric.setHttpResponseCode(response.status);
    httpMetric.setResponseContentType(response.headers['content-type']);
    await httpMetric.stop();

    return response;
}, async (error) => {
    const {httpMetric} = error.config.metadata;

    httpMetric.setHttpResponseCode(error.response ? error.response.status : 0);
    await httpMetric.stop();

    return Promise.reject(error);
});

export default axiosInstance;