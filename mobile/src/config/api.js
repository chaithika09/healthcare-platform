import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── Endpoints ───────────────────────────────────────────────
// Swap to production URLs before releasing to store
export const API_URL    = 'http://172.25.60.252:5000/api/v1';
export const SOCKET_URL = 'http://172.25.60.252:5000';

// Production (uncomment when deploying):
// export const API_URL    = 'https://mediq-backend-vcus.onrender.com/api/v1';
// export const SOCKET_URL = 'https://mediq-backend-vcus.onrender.com';

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT from AsyncStorage on every request
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-clear tokens on 401
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    if (err.response?.status === 401) {
      await AsyncStorage.multiRemove(['token', 'user', 'refreshToken']);
    }
    return Promise.reject(err);
  }
);

// ─── Auth ─────────────────────────────────────────────────────
export const authAPI = {
  login:          (d) => api.post('/auth/login', d),
  register:       (d) => api.post('/auth/register', d),
  logout:         ()  => api.post('/auth/logout'),
  forgotPassword: (d) => api.post('/auth/forgot-password', d),
  getMe:          ()  => api.get('/auth/me'),
};

// ─── Patient ──────────────────────────────────────────────────
export const patientAPI = {
  getProfile:   ()  => api.get('/patients/me'),
  getDashboard: ()  => api.get('/patients/dashboard'),
  update:       (d) => api.put('/patients/me', d),
};

// ─── Doctor ───────────────────────────────────────────────────
export const doctorAPI = {
  getAll:                  (p)     => api.get('/doctors', { params: p }),
  getById:                 (id)    => api.get(`/doctors/${id}`),
  getDashboard:            ()      => api.get('/doctors/dashboard'),
  getAppointments:         (p)     => api.get('/doctors/appointments', { params: p }),
  updateAppointmentStatus: (id, s) => api.patch(`/appointments/${id}`, { status: s }),
  createPrescription:      (d)     => api.post('/prescriptions', d),
  updateProfile:           (d)     => api.put('/doctors/me', d),
};

// ─── Appointments ─────────────────────────────────────────────
export const appointmentAPI = {
  getAll:   (p)           => api.get('/appointments', { params: p }),
  book:     (d)           => api.post('/appointments', d),
  cancel:   (id, d)       => api.patch(`/appointments/${id}/cancel`, d),
  getSlots: (docId, date) => api.get(`/appointments/slots/${docId}`, { params: { date } }),
};

// ─── Records ──────────────────────────────────────────────────
export const recordAPI = {
  getAll:  ()      => api.get('/records'),
  upload:  (d)     => api.post('/records', d, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete:  (id)    => api.delete(`/records/${id}`),
};

// ─── Prescriptions ────────────────────────────────────────────
export const prescriptionAPI = {
  getAll: () => api.get('/prescriptions'),
};

// ─── Notifications ────────────────────────────────────────────
export const notificationAPI = {
  getAll:      ()   => api.get('/notifications'),
  markRead:    (id) => api.patch(`/notifications/${id}/read`),
  markAllRead: ()   => api.patch('/notifications/read-all'),
};

// ─── Chat ─────────────────────────────────────────────────────
export const chatAPI = {
  getConversations: ()        => api.get('/chat/conversations'),
  getMessages:      (id)      => api.get(`/chat/conversations/${id}/messages`),
  sendMessage:      (id, d)   => api.post(`/chat/conversations/${id}/messages`, d),
  createOrGet:      (d)       => api.post('/chat/conversations', d),
};

// ─── Ambulance / Emergency ────────────────────────────────────
export const ambulanceAPI = {
  request:       (d)  => api.post('/ambulance/request', d),
  getMyRequests: ()   => api.get('/ambulance/my-requests'),
};

// ─── Lab Tests ────────────────────────────────────────────────
export const labAPI = {
  getTests:    () => api.get('/lab-tests'),
  book:        (d) => api.post('/lab-tests/book', d),
  getBookings: () => api.get('/lab-tests/bookings'),
};

// ─── Payments ─────────────────────────────────────────────────
export const paymentAPI = {
  getHistory: () => api.get('/payments'),
};

export default api;
