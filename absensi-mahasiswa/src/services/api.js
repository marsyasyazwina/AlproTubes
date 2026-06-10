// src/services/api.js
//
// ⚠️  PENTING: Ganti IP sesuai komputer kamu!
//
// Cara cari IP:
//   - Windows : buka CMD → ketik `ipconfig` → lihat "IPv4 Address"
//   - Mac/Linux: buka Terminal → ketik `ifconfig` → lihat "inet"
//
// Contoh: const API_BASE_URL = 'http://192.168.1.100:8080/api';
//
// Kalau pakai emulator Android bawaan Android Studio, pakai:
//   const API_BASE_URL = 'http://10.0.2.2:8080/api';
//
// Kalau pakai Expo Go di HP fisik, WAJIB pakai IP lokal (bukan localhost).

const API_BASE_URL = 'http://localhost:8080/api';

// Helper: fetch dengan timeout supaya tidak nge-hang selamanya
const fetchWithTimeout = async (url, options = {}, timeoutMs = 10000) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    return response;
  } finally {
    clearTimeout(timer);
  }
};

export const api = {
  // ==================== STUDENTS ====================

  getStudents: async () => {
    try {
      const response = await fetchWithTimeout(`${API_BASE_URL}/students/`);
      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error fetching students:', error);
      return [];
    }
  },

  createStudent: async (studentData) => {
    try {
      const response = await fetchWithTimeout(`${API_BASE_URL}/students/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(studentData),
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating student:', error);
      return { status: 500, message: error.message };
    }
  },

  updateStudent: async (nim, studentData) => {
    try {
      const response = await fetchWithTimeout(`${API_BASE_URL}/students/${nim}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(studentData),
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error updating student:', error);
      return { status: 500, message: error.message };
    }
  },

  deleteStudent: async (nim) => {
    try {
      const response = await fetchWithTimeout(`${API_BASE_URL}/students/${nim}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error deleting student:', error);
      return { status: 500, message: error.message };
    }
  },

  // ==================== ATTENDANCES ====================

  getAttendances: async () => {
    try {
      const response = await fetchWithTimeout(`${API_BASE_URL}/attendances/`);
      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error fetching attendances:', error);
      return [];
    }
  },

  createAttendance: async (attendanceData) => {
    try {
      const response = await fetchWithTimeout(`${API_BASE_URL}/attendances/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(attendanceData),
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating attendance:', error);
      return { status: 500, message: error.message };
    }
  },

  updateAttendance: async (id, attendanceData) => {
    try {
      const response = await fetchWithTimeout(`${API_BASE_URL}/attendances/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(attendanceData),
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error updating attendance:', error);
      return { status: 500, message: error.message };
    }
  },

  deleteAttendance: async (id) => {
    try {
      const response = await fetchWithTimeout(`${API_BASE_URL}/attendances/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error deleting attendance:', error);
      return { status: 500, message: error.message };
    }
  },

  getAttendanceByDate: async (date) => {
    try {
      const response = await fetchWithTimeout(`${API_BASE_URL}/attendances/date?date=${date}`);
      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error fetching attendance by date:', error);
      return null;
    }
  },

  searchStudentsByName: async (name) => {
    try {
      const response = await fetchWithTimeout(
        `${API_BASE_URL}/attendances/search?name=${encodeURIComponent(name)}`
      );
      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error searching students:', error);
      return [];
    }
  },

  // ==================== STATS ====================

  getTodayStats: async () => {
    try {
      const response = await fetchWithTimeout(`${API_BASE_URL}/stats/today`);
      const data = await response.json();
      return data.data || {
        totalStudents: 0, hadir: 0, tidakHadir: 0, izin: 0, sakit: 0, persentaseHadir: 0,
      };
    } catch (error) {
      console.error('Error fetching today stats:', error);
      return { totalStudents: 0, hadir: 0, tidakHadir: 0, izin: 0, sakit: 0, persentaseHadir: 0 };
    }
  },

  getRanking: async (sort = 'desc') => {
    try {
      const response = await fetchWithTimeout(`${API_BASE_URL}/stats/ranking?sort=${sort}`);
      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error fetching ranking:', error);
      return [];
    }
  },
};