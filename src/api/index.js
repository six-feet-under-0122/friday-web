import axios from 'axios';
import { ElMessage } from 'element-plus';

const request = axios.create({
  baseURL: 'http://localhost:5001',
  timeout: 30000
});

// 请求拦截器 - 添加 token
request.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

// 响应拦截器 - 统一错误处理
request.interceptors.response.use(
  response => response.data,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      ElMessage.error('登录已过期，请重新登录');
      window.location.href = '/';
    } else {
      ElMessage.error(error.response?.data?.msg || '请求失败');
    }
    return Promise.reject(error);
  }
);

//
export const authAPI = {
  register: (data) => request.post('/register', data),
  login: (data) => request.post('/login', data),
};

export const documentAPI = {
  upload: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return request.post('/upload', formData);
  },
  getList: () => request.get('/documents'),
  delete: (id) => request.delete(`/document/${id}`),
  getAnalysis: () => request.get('/analysis'),
};

export const chatAPI = {
  sendMessage: (data) => request.post('/chat', data),
  getSessions: () => request.get('/sessions'),
  createSession: () => request.post('/session'),
  deleteSession: (id) => request.delete(`/session/${id}`),
  getHistory: (sessionId) => request.get(`/session/${sessionId}/history`),
};

export default request;