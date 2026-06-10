export const mockStudents = [
  { nim: '001', name: 'Aditya Nugraha', class: 'XII MIPA 1', major: 'IPA' },
  { nim: '002', name: 'Bambang Pamungkas', class: 'XII MIPA 2', major: 'IPA' },
  { nim: '003', name: 'Citra Rahmawati', class: 'XII IPS 1', major: 'IPS' },
  { nim: '004', name: 'Deni Wijaya', class: 'XII MIPA 1', major: 'IPA' },
  { nim: '005', name: 'Eka Saputri', class: 'XII IPS 2', major: 'IPS' },
  { nim: '006', name: 'Fajar Pratama', class: 'XII MIPA 3', major: 'IPA' },
  { nim: '007', name: 'Gita Puspita', class: 'XII IPS 1', major: 'IPS' },
  { nim: '008', name: 'Hendra Setiawan', class: 'XII MIPA 2', major: 'IPA' },
  { nim: '009', name: 'Indah Permata', class: 'XII MIPA 1', major: 'IPA' },
  { nim: '010', name: 'Joko Susilo', class: 'XII IPS 2', major: 'IPS' },
  { nim: '011', name: 'Kirana Dewi', class: 'XII MIPA 3', major: 'IPA' },
  { nim: '012', name: 'Lukman Hakim', class: 'XII IPS 1', major: 'IPS' },
];

export const mockAttendances = [
  { id: '1', nim: '001', date: '2026-06-07', status: 'Hadir' },
  { id: '2', nim: '002', date: '2026-06-07', status: 'Tidak Hadir' },
  { id: '3', nim: '003', date: '2026-06-07', status: 'Hadir' },
  { id: '4', nim: '004', date: '2026-06-07', status: 'Hadir' },
  { id: '5', nim: '005', date: '2026-06-07', status: 'Tidak Hadir' },
  { id: '6', nim: '006', date: '2026-06-07', status: 'Izin' },
  { id: '7', nim: '007', date: '2026-06-07', status: 'Hadir' },
  { id: '8', nim: '008', date: '2026-06-07', status: 'Hadir' },
  { id: '9', nim: '009', date: '2026-06-07', status: 'Sakit' },
  { id: '10', nim: '010', date: '2026-06-07', status: 'Hadir' },
  { id: '11', nim: '011', date: '2026-06-07', status: 'Hadir' },
  { id: '12', nim: '012', date: '2026-06-07', status: 'Izin' },
];

export const weeklyData = [
  { day: 'Sen', hadir: 42, tidakHadir: 3, izin: 2, sakit: 1 },
  { day: 'Sel', hadir: 44, tidakHadir: 2, izin: 1, sakit: 1 },
  { day: 'Rab', hadir: 40, tidakHadir: 5, izin: 2, sakit: 1 },
  { day: 'Kam', hadir: 43, tidakHadir: 2, izin: 2, sakit: 1 },
  { day: 'Jum', hadir: 41, tidakHadir: 4, izin: 1, sakit: 2 },
];

export const studentStats = [
  { nim: '001', name: 'Aditya Nugraha', totalHadir: 142, totalTidak: 2, persentase: 98.6 },
  { nim: '002', name: 'Bambang Pamungkas', totalHadir: 140, totalTidak: 4, persentase: 97.2 },
  { nim: '003', name: 'Citra Rahmawati', totalHadir: 138, totalTidak: 6, persentase: 95.8 },
  { nim: '004', name: 'Deni Wijaya', totalHadir: 135, totalTidak: 9, persentase: 93.7 },
  { nim: '005', name: 'Eka Saputri', totalHadir: 132, totalTidak: 12, persentase: 91.6 },
  { nim: '006', name: 'Fajar Pratama', totalHadir: 130, totalTidak: 14, persentase: 90.3 },
  { nim: '007', name: 'Gita Puspita', totalHadir: 128, totalTidak: 16, persentase: 88.9 },
  { nim: '008', name: 'Hendra Setiawan', totalHadir: 125, totalTidak: 19, persentase: 86.8 },
  { nim: '009', name: 'Indah Permata', totalHadir: 120, totalTidak: 24, persentase: 83.3 },
  { nim: '010', name: 'Joko Susilo', totalHadir: 115, totalTidak: 29, persentase: 79.9 },
];

export const getTodayAttendance = () => {
  const today = new Date().toISOString().split('T')[0];
  return mockAttendances.filter(a => a.date === today);
};

export const getAttendanceStats = () => {
  const todayData = getTodayAttendance();
  const totalStudents = mockStudents.length;
  const hadir = todayData.filter(a => a.status === 'Hadir').length;
  const tidakHadir = todayData.filter(a => a.status === 'Tidak Hadir').length;
  const izin = todayData.filter(a => a.status === 'Izin').length;
  const sakit = todayData.filter(a => a.status === 'Sakit').length;
  const persentaseHadir = totalStudents > 0 ? (hadir / totalStudents) * 100 : 0;

  return {
    totalStudents,
    hadir,
    tidakHadir,
    izin,
    sakit,
    persentaseHadir: persentaseHadir.toFixed(1),
  };
};