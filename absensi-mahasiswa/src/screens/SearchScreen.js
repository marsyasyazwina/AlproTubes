import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  ScrollView,
  Alert,
  FlatList,
} from 'react-native';
import colors from '../styles/colors';
import typography from '../styles/typography';
import spacing from '../styles/spacing';
import Card from '../components/Card';
import AttendanceChip from '../components/AttendanceChip';

const API_BASE_URL = 'http://localhost:8080/api';

export default function SearchScreen() {
  const [students, setStudents] = useState([]);
  const [searchNIM, setSearchNIM] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [studentInfo, setStudentInfo] = useState(null);

  // Load students untuk validasi NIM
  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/students/`);
      const data = await response.json();
      setStudents(data.data || []);
    } catch (error) {
      console.error('Error loading students:', error);
    }
  };

  // Cek apakah NIM valid
  const isValidNIM = (nim) => {
    return students.some(s => s.nim === nim);
  };

  // Get student info by NIM
  const getStudentByNIM = (nim) => {
    return students.find(s => s.nim === nim);
  };

  // Validasi format tanggal YYYY-MM-DD
  const isValidDate = (date) => {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) return false;
    const d = new Date(date);
    return d instanceof Date && !isNaN(d);
  };

  // Pencarian kehadiran dengan filter tanggal
  const handleSearch = async () => {
    if (!searchNIM.trim()) {
      Alert.alert('Error', 'Masukkan NIM siswa terlebih dahulu');
      return;
    }

    // Validasi NIM
    if (!isValidNIM(searchNIM)) {
      Alert.alert('Error', `NIM ${searchNIM} tidak ditemukan`);
      return;
    }

    // Validasi tanggal (minimal salah satu diisi)
    if (!startDate.trim() && !endDate.trim()) {
      Alert.alert('Error', 'Masukkan tanggal awal atau akhir pencarian');
      return;
    }

    // Validasi format tanggal jika diisi
    if (startDate && !isValidDate(startDate)) {
      Alert.alert('Error', 'Format tanggal awal harus YYYY-MM-DD');
      return;
    }
    if (endDate && !isValidDate(endDate)) {
      Alert.alert('Error', 'Format tanggal akhir harus YYYY-MM-DD');
      return;
    }

    // Validasi startDate <= endDate
    if (startDate && endDate && startDate > endDate) {
      Alert.alert('Error', 'Tanggal awal harus lebih kecil dari tanggal akhir');
      return;
    }

    setLoading(true);
    setHasSearched(true);

    try {
      // Dapatkan semua data absensi
      const response = await fetch(`${API_BASE_URL}/attendances/`);
      const data = await response.json();
      const allAttendances = data.data || [];

      // Filter berdasarkan NIM
      let studentAttendances = allAttendances.filter(a => a.nim === searchNIM);

      // Filter berdasarkan rentang tanggal
      if (startDate) {
        studentAttendances = studentAttendances.filter(a => a.date >= startDate);
      }
      if (endDate) {
        studentAttendances = studentAttendances.filter(a => a.date <= endDate);
      }

      // Urutkan berdasarkan tanggal (terbaru di atas)
      const sortedResults = [...studentAttendances].sort((a, b) => {
        if (a.date > b.date) return -1;
        if (a.date < b.date) return 1;
        return 0;
      });

      setSearchResults(sortedResults);
      setStudentInfo(getStudentByNIM(searchNIM));
    } catch (error) {
      console.error('Search error:', error);
      Alert.alert('Error', 'Terjadi kesalahan saat mencari data');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSearchNIM('');
    setStartDate('');
    setEndDate('');
    setSearchResults([]);
    setStudentInfo(null);
    setHasSearched(false);
  };

  // Format tanggal untuk display
  const formatDisplayDate = (dateString) => {
    if (!dateString) return '';
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const [year, month, day] = dateString.split('-');
    return `${day} ${months[parseInt(month) - 1]} ${year}`;
  };

  // Render item hasil pencarian
  const renderAttendanceItem = ({ item }) => (
    <View style={styles.attendanceItem}>
      <View style={styles.attendanceItemLeft}>
        <Text style={styles.attendanceItemDate}>📅 {formatDisplayDate(item.date)}</Text>
      </View>
      <View style={styles.attendanceItemRight}>
        <AttendanceChip status={item.status} />
      </View>
    </View>
  );

  // Hitung statistik kehadiran
  const getAttendanceStats = () => {
    const hadir = searchResults.filter(r => r.status === 'Hadir').length;
    const tidakHadir = searchResults.filter(r => r.status === 'Tidak Hadir').length;
    const izin = searchResults.filter(r => r.status === 'Izin').length;
    const sakit = searchResults.filter(r => r.status === 'Sakit').length;
    const total = searchResults.length;
    const persentaseHadir = total > 0 ? (hadir / total * 100).toFixed(1) : 0;
    
    return { hadir, tidakHadir, izin, sakit, total, persentaseHadir };
  };

  const stats = getAttendanceStats();

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Cari Riwayat Kehadiran</Text>
      <Text style={styles.subtitle}>
        Cari riwayat kehadiran mahasiswa berdasarkan NIM dan filter tanggal.
      </Text>

      <Card style={styles.formCard}>
        {/* Input NIM */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>NIM Mahasiswa</Text>
          <TextInput
            style={styles.input}
            placeholder="Contoh: S001"
            placeholderTextColor={colors.outline}
            value={searchNIM}
            onChangeText={setSearchNIM}
            autoCapitalize="characters"
          />
        </View>

        {/* Filter Tanggal */}
        <View style={styles.dateRangeContainer}>
          <Text style={styles.label}>Filter Tanggal</Text>
          <View style={styles.dateRangeRow}>
            <View style={styles.dateInputWrapper}>
              <Text style={styles.dateLabel}>Dari</Text>
              <TextInput
                style={styles.dateInput}
                placeholder="2024-01-01"
                placeholderTextColor={colors.outline}
                value={startDate}
                onChangeText={setStartDate}
              />
            </View>
            <View style={styles.dateInputWrapper}>
              <Text style={styles.dateLabel}>Sampai</Text>
              <TextInput
                style={styles.dateInput}
                placeholder="2024-12-31"
                placeholderTextColor={colors.outline}
                value={endDate}
                onChangeText={setEndDate}
              />
            </View>
          </View>
          <Text style={styles.dateHint}>Format: YYYY-MM-DD (contoh: 2026-06-07)</Text>
        </View>

        {/* Tombol Aksi */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.searchButton} onPress={handleSearch} disabled={loading}>
            {loading ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <Text style={styles.searchButtonText}>Cari Kehadiran</Text>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
            <Text style={styles.resetButtonText}>Reset</Text>
          </TouchableOpacity>
        </View>
      </Card>

      {/* Hasil Pencarian */}
      {hasSearched && !loading && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultTitle}>HASIL PENCARIAN</Text>
          
          {/* Informasi Mahasiswa */}
          {studentInfo && (
            <Card style={styles.studentInfoCard}>
              <Text style={styles.studentName}>{studentInfo.name}</Text>
              <Text style={styles.studentNim}>NIM: {studentInfo.nim}</Text>
              <Text style={styles.studentClass}>{studentInfo.class} - {studentInfo.major}</Text>
            </Card>
          )}

          {/* Statistik Ringkasan */}
          {searchResults.length > 0 && (
            <Card style={styles.statsCard}>
              <Text style={styles.statsTitle}>Ringkasan Kehadiran</Text>
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={[styles.statNumber, styles.hadirNumber]}>{stats.hadir}</Text>
                  <Text style={styles.statLabel}>Hadir</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={[styles.statNumber, styles.tidakHadirNumber]}>{stats.tidakHadir}</Text>
                  <Text style={styles.statLabel}>Tidak Hadir</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={[styles.statNumber, styles.izinNumber]}>{stats.izin}</Text>
                  <Text style={styles.statLabel}>Izin</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={[styles.statNumber, styles.sakitNumber]}>{stats.sakit}</Text>
                  <Text style={styles.statLabel}>Sakit</Text>
                </View>
              </View>
              <View style={styles.persentaseContainer}>
                <Text style={styles.persentaseLabel}>Persentase Kehadiran:</Text>
                <Text style={styles.persentaseValue}>{stats.persentaseHadir}%</Text>
              </View>
              <Text style={styles.totalRecord}>Total {stats.total} catatan kehadiran</Text>
            </Card>
          )}

          {/* Daftar Kehadiran */}
          {searchResults.length > 0 ? (
            <Card style={styles.attendanceListCard}>
              <Text style={styles.attendanceListTitle}>📋 Daftar Kehadiran</Text>
              <FlatList
                data={searchResults}
                keyExtractor={(item) => item.id}
                renderItem={renderAttendanceItem}
                scrollEnabled={false}
              />
            </Card>
          ) : (
            <Card style={styles.noResultCard}>
              <Text style={styles.noResultIcon}>📋</Text>
              <Text style={styles.noResultText}>
                Tidak ditemukan data kehadiran
              </Text>
              <Text style={styles.noResultSubText}>
                Mahasiswa {studentInfo?.name} tidak memiliki catatan kehadiran
                {startDate && endDate && ` untuk periode ${formatDisplayDate(startDate)} - ${formatDisplayDate(endDate)}`}
                {startDate && !endDate && ` dari tanggal ${formatDisplayDate(startDate)}`}
                {!startDate && endDate && ` sampai tanggal ${formatDisplayDate(endDate)}`}
              </Text>
            </Card>
          )}

          {/* Informasi Pencarian */}
          <Card style={styles.infoCard}>
            <Text style={styles.infoTitle}>🔍 Metode Pencarian</Text>
            <Text style={styles.infoText}>
              • Pencarian menggunakan metode <Text style={styles.infoHighlight}>Sequential Search</Text> untuk filter NIM dan tanggal
            </Text>
            <Text style={styles.infoText}>
              • Data diurutkan berdasarkan tanggal (terbaru ke terbaru)
            </Text>
            <Text style={styles.infoText}>
              • Mendukung filter rentang tanggal (Dari - Sampai)
            </Text>
          </Card>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
    padding: spacing.md,
  },
  title: {
    ...typography.headlineMedium,
    color: colors.onSurface,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.bodyMedium,
    color: colors.onSurfaceVariant,
    marginBottom: spacing.lg,
  },
  formCard: {
    padding: spacing.lg,
  },
  inputContainer: {
    marginBottom: spacing.md,
  },
  label: {
    ...typography.labelMedium,
    color: colors.onSurfaceVariant,
    marginBottom: spacing.xs,
  },
  input: {
    height: spacing.touchTarget,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    ...typography.bodyMedium,
    color: colors.onSurface,
    backgroundColor: colors.surfaceContainerLowest,
  },
  dateRangeContainer: {
    marginBottom: spacing.md,
  },
  dateRangeRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  dateInputWrapper: {
    flex: 1,
  },
  dateLabel: {
    ...typography.labelSmall,
    color: colors.outline,
    marginBottom: 2,
  },
  dateInput: {
    height: spacing.touchTarget,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    ...typography.bodyMedium,
    color: colors.onSurface,
    backgroundColor: colors.surfaceContainerLowest,
  },
  dateHint: {
    ...typography.labelSmall,
    color: colors.outline,
    marginTop: spacing.xs,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  searchButton: {
    flex: 2,
    height: spacing.touchTarget,
    backgroundColor: colors.primary,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchButtonText: {
    ...typography.labelLarge,
    color: colors.onPrimary,
  },
  resetButton: {
    flex: 1,
    height: spacing.touchTarget,
    backgroundColor: colors.surfaceContainerHighest,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resetButtonText: {
    ...typography.labelLarge,
    color: colors.onSurfaceVariant,
  },
  resultContainer: {
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
  },
  resultTitle: {
    ...typography.labelLarge,
    color: colors.onSurfaceVariant,
    marginBottom: spacing.md,
  },
  studentInfoCard: {
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  studentName: {
    ...typography.headlineSmall,
    color: colors.onSurface,
    marginBottom: spacing.xs,
  },
  studentNim: {
    ...typography.bodyMedium,
    color: colors.outline,
    marginBottom: spacing.xs,
  },
  studentClass: {
    ...typography.bodyMedium,
    color: colors.secondary,
  },
  statsCard: {
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  statsTitle: {
    ...typography.labelLarge,
    color: colors.onSurface,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.md,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    ...typography.headlineSmall,
  },
  hadirNumber: {
    color: colors.present,
  },
  tidakHadirNumber: {
    color: colors.absent,
  },
  izinNumber: {
    color: colors.permission,
  },
  sakitNumber: {
    color: colors.sick,
  },
  statLabel: {
    ...typography.labelSmall,
    color: colors.onSurfaceVariant,
    marginTop: spacing.xs,
  },
  persentaseContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.outlineVariant,
  },
  persentaseLabel: {
    ...typography.bodyMedium,
    color: colors.onSurfaceVariant,
  },
  persentaseValue: {
    ...typography.headlineSmall,
    color: colors.primary,
  },
  totalRecord: {
    ...typography.labelSmall,
    color: colors.outline,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  attendanceListCard: {
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  attendanceListTitle: {
    ...typography.labelLarge,
    color: colors.onSurface,
    marginBottom: spacing.md,
  },
  attendanceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.outlineVariant,
  },
  attendanceItemLeft: {
    flex: 1,
  },
  attendanceItemDate: {
    ...typography.bodyMedium,
    color: colors.onSurface,
  },
  attendanceItemRight: {
    width: 100,
    alignItems: 'flex-end',
  },
  noResultCard: {
    padding: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  noResultIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  noResultText: {
    ...typography.bodyLarge,
    color: colors.outline,
    textAlign: 'center',
  },
  noResultSubText: {
    ...typography.bodyMedium,
    color: colors.outline,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  infoCard: {
    padding: spacing.md,
    backgroundColor: colors.surfaceContainerHighest,
  },
  infoTitle: {
    ...typography.labelLarge,
    color: colors.onSurface,
    marginBottom: spacing.sm,
  },
  infoText: {
    ...typography.bodySmall,
    color: colors.onSurfaceVariant,
    marginBottom: spacing.xs,
  },
  infoHighlight: {
    fontWeight: 'bold',
    color: colors.primary,
  },
});