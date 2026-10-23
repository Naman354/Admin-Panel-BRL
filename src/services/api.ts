import { Participant, MetricsData, AttendanceResult, DatabaseStatus } from '../types';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

function getHeaders(): HeadersInit {
  const token = localStorage.getItem('admin_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      ...getHeaders(),
      ...(options.headers || {}),
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error: any = new Error(data.message || 'API request failed');
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const api = {
  // Auth
  async login(password: string, username = 'admin') {
    return request<{ success: boolean; token: string; user: any; message?: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  },

  async verifyToken() {
    return request<{ success: boolean; valid: boolean; user: any }>('/auth/verify');
  },

  // Metrics
  async getMetrics(): Promise<MetricsData> {
    const res = await request<{ success: boolean; data: MetricsData }>('/metrics');
    return res.data;
  },

  // Participants
  async getParticipants(params: {
    search?: string;
    branch?: string;
    year?: string;
    gender?: string;
    residency?: string;
    attendance?: string;
  } = {}): Promise<Participant[]> {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val && val !== 'All') {
        searchParams.append(key, val);
      }
    });
    const queryString = searchParams.toString() ? `?${searchParams.toString()}` : '';
    const res = await request<{ success: boolean; count: number; data: Participant[] }>(`/participants${queryString}`);
    return res.data;
  },

  async getParticipant(identifier: string): Promise<Participant> {
    const res = await request<{ success: boolean; data: Participant }>(`/participants/${encodeURIComponent(identifier)}`);
    return res.data;
  },

  async addParticipant(participant: Partial<Participant>): Promise<Participant> {
    const res = await request<{ success: boolean; data: Participant }>('/participants', {
      method: 'POST',
      body: JSON.stringify(participant),
    });
    return res.data;
  },

  // Attendance
  async markAttendance(identifier: string, method: 'BARCODE' | 'MANUAL' = 'BARCODE'): Promise<AttendanceResult> {
    try {
      const res = await request<AttendanceResult>('/attendance/mark', {
        method: 'POST',
        body: JSON.stringify({ identifier, method }),
      });
      return res;
    } catch (err: any) {
      if (err.data) {
        return err.data as AttendanceResult;
      }
      return {
        success: false,
        error: 'NETWORK_ERROR',
        message: err.message || 'Network error occurred while marking attendance',
      };
    }
  },

  async toggleAttendance(identifier: string, marked: boolean): Promise<Participant> {
    const res = await request<{ success: boolean; participant: Participant }>('/attendance/toggle', {
      method: 'POST',
      body: JSON.stringify({ identifier, marked }),
    });
    return res.participant;
  },

  // Status & Reset
  async getStatus(): Promise<{ success: boolean; database: DatabaseStatus; server: string }> {
    return request('/status');
  },

  async resetData(): Promise<{ success: boolean; message: string }> {
    return request('/reset-data', { method: 'POST' });
  },
};
