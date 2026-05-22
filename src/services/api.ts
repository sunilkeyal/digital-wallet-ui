import axios from 'axios';
import type { AxiosInstance } from 'axios';
import type { ImmunizationDto, InsuranceCardDto, LabResultDto, NoteDto, NoteGroupDto, PageResponse, LoginRequest, LoginResponse, User } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const immunizationApi = {
  getAll: (page = 0, size = 10, sortBy = 'vaccineName', sortDir = 'asc'): Promise<{ data: PageResponse<ImmunizationDto> | ImmunizationDto[] }> =>
    api.get('/immunizations', { params: { page, size, sortBy, sortDir } }),
  getById: (id: string): Promise<{ data: ImmunizationDto }> =>
    api.get(`/immunizations/${id}`),
  create: (data: ImmunizationDto): Promise<{ data: ImmunizationDto }> =>
    api.post('/immunizations', data),
  update: (id: string, data: ImmunizationDto): Promise<{ data: ImmunizationDto }> =>
    api.put(`/immunizations/${id}`, data),
  delete: (id: string): Promise<{ data: void }> =>
    api.delete(`/immunizations/${id}`),
};

export const insuranceCardApi = {
  getAll: (page = 0, size = 10, sortBy = 'provider', sortDir = 'asc'): Promise<{ data: PageResponse<InsuranceCardDto> | InsuranceCardDto[] }> =>
    api.get('/insurance-cards', { params: { page, size, sortBy, sortDir } }),
  getById: (id: string): Promise<{ data: InsuranceCardDto }> =>
    api.get(`/insurance-cards/${id}`),
  create: (data: InsuranceCardDto): Promise<{ data: InsuranceCardDto }> =>
    api.post('/insurance-cards', data),
  update: (id: string, data: InsuranceCardDto): Promise<{ data: InsuranceCardDto }> =>
    api.put(`/insurance-cards/${id}`, data),
  delete: (id: string): Promise<{ data: void }> =>
    api.delete(`/insurance-cards/${id}`),
};

export const labResultApi = {
  getAll: (page = 0, size = 10, sortBy = 'testDate', sortDir = 'desc'): Promise<{ data: PageResponse<LabResultDto> | LabResultDto[] }> =>
    api.get('/lab-results', { params: { page, size, sortBy, sortDir } }),
  getById: (id: string): Promise<{ data: LabResultDto }> =>
    api.get(`/lab-results/${id}`),
  create: (data: LabResultDto): Promise<{ data: LabResultDto }> =>
    api.post('/lab-results', data),
  update: (id: string, data: LabResultDto): Promise<{ data: LabResultDto }> =>
    api.put(`/lab-results/${id}`, data),
  delete: (id: string): Promise<{ data: void }> =>
    api.delete(`/lab-results/${id}`),
};

export const authApi = {
  login: (data: LoginRequest): Promise<{ data: LoginResponse }> => 
    api.post('/auth/login', data),
  getCurrentUser: (): Promise<{ data: User }> => 
    api.get('/auth/me'),
  getAllUsers: (): Promise<{ data: User[] }> => 
    api.get('/admin/users'),
  createUser: (data: { email: string; password: string; firstName?: string; lastName?: string; roles: string[] }): Promise<{ data: User }> => 
    api.post('/admin/users', data),
  deleteUser: (id: string): Promise<{ data: void }> => 
    api.delete(`/admin/users/${id}`),
  seedData: (userId: string): Promise<{ data: { message: string } }> =>
    api.post('/admin/seed', { userId }),
};

export const noteGroupApi = {
  getAll: (): Promise<{ data: NoteGroupDto[] }> =>
    api.get('/note-groups'),
  create: (data: { name: string }): Promise<{ data: NoteGroupDto }> =>
    api.post('/note-groups', data),
  update: (id: string, data: { name: string }): Promise<{ data: NoteGroupDto }> =>
    api.put(`/note-groups/${id}`, data),
  delete: (id: string): Promise<{ data: void }> =>
    api.delete(`/note-groups/${id}`),
  reorder: (groupIds: string[]): Promise<{ data: void }> =>
    api.put('/note-groups/reorder', { groupIds }),
};

export const noteApi = {
  getRecent: (): Promise<{ data: NoteDto[] }> =>
    api.get('/notes/recent'),
  getByGroup: (groupId: string): Promise<{ data: NoteDto[] }> =>
    api.get('/notes', { params: { groupId } }),
  getById: (id: string): Promise<{ data: NoteDto }> =>
    api.get(`/notes/${id}`),
  create: (data: NoteDto): Promise<{ data: NoteDto }> =>
    api.post('/notes', data),
  update: (id: string, data: NoteDto): Promise<{ data: NoteDto }> =>
    api.put(`/notes/${id}`, data),
  recordView: (id: string): Promise<{ data: NoteDto }> =>
    api.put(`/notes/${id}/view`),
  reorder: (groupId: string, noteIds: string[]): Promise<{ data: void }> =>
    api.put('/notes/reorder', { groupId, noteIds }),
  delete: (id: string): Promise<{ data: void }> =>
    api.delete(`/notes/${id}`),
};

export default api;
