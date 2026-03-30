/// <reference types="vite/client" />
import axios, { InternalAxiosRequestConfig } from 'axios';

// Detect if running locally or on Render
const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const API_URL = isLocal 
  ? (import.meta.env.VITE_API_URL || 'http://localhost:3000/api')
  : '/api'; // Use the same-origin proxy on Render

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
