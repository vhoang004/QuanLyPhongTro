import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`, config.params || config.data || '');
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => {
    console.log(`[API] ${response.config.method?.toUpperCase()} ${response.config.url} => ${response.status}`, response.data);
    return response;
  },
  (error) => {
    console.log(`[API] ERROR ${error.config?.method?.toUpperCase()} ${error.config?.url} => ${error.response?.status}`, error.response?.data);
    if (error.response?.status === 401) {
      const isLoginRequest = error.config?.url?.includes('/auth/login');
      if (!isLoginRequest) {
        // #region agent log
        fetch('http://127.0.0.1:7691/ingest/b7170261-fdc1-4338-8711-7e3024e1f6c4',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'c12ae2'},body:JSON.stringify({sessionId:'c12ae2',location:'api.js:401',message:'401 interceptor redirecting to /login',data:{url:error.config?.url},runId:'post-fix',hypothesisId:'H2',timestamp:Date.now()})}).catch(()=>{});
        // #endregion
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
