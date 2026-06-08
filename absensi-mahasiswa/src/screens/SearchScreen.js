import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
} from 'react-native';
import colors from '../styles/colors';
import typography from '../styles/typography';
import spacing from '../styles/spacing';
import Card from '../components/Card';
import { api } from '../services/api';
import { formatDisplayDate } from '../utils/helpers';

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [attendances, setAttendances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedClass, setSelectedClass] = useState('Semua');

  // Load data from API
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [studentsData, attendancesData] = await Promise.all([
      api.getStudents(),
      api.getAttendances(),
    ]);
    setAllStudents(studentsData);
    setAttendances(attendancesData);
    setSearchResults(studentsData);
    setLoading(false);
  };

  // Extract unique classes from students
  const getUniqueClasses = () => {
    const classes = ['Semua'];
    allStudents.forEach(student => {
      if (student.class && !classes.includes(student.class)) {
        classes.push(student.class);
      }
    });
    return classes;
  };

  const classes = getUniqueClasses();

  // Filter by class
  const filterByClass = (className) => {
    setSelectedClass(className);
    
    let filtered = [...allStudents];
    
    if (className !== 'Semua') {
      filtered = filtered.filter(student => student.class === className);
    }
    
    if (hasSearched && searchQuery.trim() !== '') {
      filtered = filtered.filter(student => 
        student.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    setSearchResults(filtered);
  };

  const handleSearch = () => {
    if (searchQuery.trim() === '') {
      // Jika kosong, tampilkan semua berdasarkan filter kelas
      let filtered = [...allStudents];
      if (selectedClass !== 'Semua') {
        filtered = filtered.filter(student => student.class === selectedClass);
      }
      setSearchResults(filtered);
      setHasSearched(false);
      return;
    }
    
    // Filter berdasarkan nama dan kelas
    let filtered = allStudents.filter(student => 
      student.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    if (selectedClass !== 'Semua') {
      filtered = filtered.filter(student => student.class === selectedClass);
    }
    
    setSearchResults(filtered);
    setHasSearched(true);
  };

  const getAttendanceForStudent = (nim) => {
    const studentAttendances = attendances.filter(a => a.nim === nim);
    if (studentAttendances.length > 0) {
      const latest = studentAttendances[studentAttendances.length - 1];
      return {
        status: latest.status,
        date: formatDisplayDate(latest.date),
      };
    }
    return null;
  };

  const renderResultItem = ({ item }) => {
    const attendance = getAttendanceForStudent(item.nim);
    return (
      <View style={styles.resultCard}>
        <View style={styles.resultHeader}>
          <Text style={styles.resultName}>{item.name}</Text>
          <Text style={styles.resultNim}>{item.nim}</Text>
        </View>
        <Text style={styles.resultClass}>{item.class}</Text>
        {attendance && (
          <View style={styles.resultAttendance}>
            <Text style={styles.resultDate}>📅 {attendance.date}</Text>
            <View style={[
              styles.statusBadge,
              attendance.status === 'Hadir' ? styles.statusHadir : styles.statusTidak
            ]}>
              <Text style={[
                styles.statusText,
                attendance.status === 'Hadir' ? styles.statusTextHadir : styles.statusTextTidak
              ]}>{attendance.status}</Text>
            </View>
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Memuat data...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cari Data Absensi</Text>
      <Text style={styles.subtitle}>
        Cari siswa berdasarkan nama untuk melihat riwayat kehadiran.
      </Text>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Cari nama siswa..."
          placeholderTextColor={colors.outline}
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Text style={styles.searchButtonText}>Cari</Text>
        </TouchableOpacity>
      </View>

      {/* Filter Kelas */}
      <View style={styles.filterContainer}>
        {classes.map((className, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.filterChip,
              selectedClass === className && styles.filterChipActive,
            ]}
            onPress={() => filterByClass(className)}
          >
            <Text style={[
              styles.filterChipText,
              selectedClass === className && styles.filterChipTextActive,
            ]}>
              {className} ({className === 'Semua' ? allStudents.length : allStudents.filter(s => s.class === className).length})
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.resultTitle}>
        {hasSearched ? 'HASIL PENCARIAN' : 'SEMUA DATA SISWA'}
      </Text>

      {searchResults.length === 0 ? (
        <Card style={styles.noResultCard}>
          <Text style={styles.noResultText}>
            {hasSearched ? `Tidak ada siswa dengan nama "${searchQuery}"` : 'Belum ada data siswa'}
          </Text>
        </Card>
      ) : (
        <FlatList
          data={searchResults}
          keyExtractor={(item) => item.nim}
          renderItem={renderResultItem}
          contentContainerStyle={styles.resultsList}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
    padding: spacing.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  loadingText: {
    ...typography.bodyMedium,
    color: colors.outline,
    marginTop: spacing.md,
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
  searchContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  searchInput: {
    flex: 1,
    height: spacing.touchTarget,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    ...typography.bodyMedium,
    color: colors.onSurface,
    backgroundColor: colors.surfaceContainerLowest,
  },
  searchButton: {
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.primary,
    borderRadius: 8,
    justifyContent: 'center',
  },
  searchButtonText: {
    ...typography.labelLarge,
    color: colors.onPrimary,
  },
  filterContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    backgroundColor: colors.surfaceContainerHighest,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
  },
  filterChipText: {
    ...typography.labelMedium,
    color: colors.onSurfaceVariant,
  },
  filterChipTextActive: {
    color: colors.onPrimary,
  },
  resultTitle: {
    ...typography.labelLarge,
    color: colors.onSurfaceVariant,
    marginBottom: spacing.md,
  },
  resultsList: {
    paddingBottom: spacing.xl,
  },
  resultCard: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4 },
      android: { elevation: 1 },
    }),
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  resultName: {
    ...typography.bodyLarge,
    color: colors.onSurface,
    fontWeight: '600',
  },
  resultNim: {
    ...typography.bodyMedium,
    color: colors.outline,
  },
  resultClass: {
    ...typography.bodyMedium,
    color: colors.onSurfaceVariant,
    marginBottom: spacing.sm,
  },
  resultAttendance: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  resultDate: {
    ...typography.bodyMedium,
    color: colors.onSurfaceVariant,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
  },
  statusHadir: {
    backgroundColor: '#E8F5E9',
  },
  statusTidak: {
    backgroundColor: '#FFEBEE',
  },
  statusText: {
    ...typography.labelSmall,
  },
  statusTextHadir: {
    color: colors.present,
  },
  statusTextTidak: {
    color: colors.absent,
  },
  noResultCard: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  noResultText: {
    ...typography.bodyMedium,
    color: colors.outline,
  },
});