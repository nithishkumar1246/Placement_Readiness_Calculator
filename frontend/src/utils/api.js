const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const config = {
    ...options,
    headers
  };
  
  if (options.body && !(options.body instanceof FormData)) {
    config.body = JSON.stringify(options.body);
  } else if (options.body && options.body instanceof FormData) {
    // Let browser set content-type for multipart forms
    delete config.headers['Content-Type'];
  }
  
  const response = await fetch(`${BASE_URL}${endpoint}`, config);
  
  if (response.status === 401) {
    localStorage.removeItem('token');
    // Force reload to route back to login if token is broken
    if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
      window.location.href = '/login';
    }
  }
  
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }
  
  return data;
}

export const api = {
  get: (endpoint, headers = {}) => request(endpoint, { method: 'GET', headers }),
  post: (endpoint, body, headers = {}) => request(endpoint, { method: 'POST', body, headers }),
  put: (endpoint, body, headers = {}) => request(endpoint, { method: 'PUT', body, headers }),
  delete: (endpoint, headers = {}) => request(endpoint, { method: 'DELETE', headers })
};
export default api;
