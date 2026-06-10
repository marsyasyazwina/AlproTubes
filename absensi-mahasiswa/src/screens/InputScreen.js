import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import colors from '../styles/colors';
import typography from '../styles/typography';
import spacing from '../styles/spacing';
import Card from '../components/Card';
import Button from '../components/Button';
import { formatDisplayDate, getTodayDate } from '../utils/helpers';

const API_BASE_URL = 'http://localhost:8080/api';

export default function InputScreen({ navigation }) {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [showStudentList, setShowStudentList] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [attendances, setAttendances] = useState([]);
  const [selectedDate, setSelectedDate] = useState(getTodayDate());
  
  const statusOptions = ['Hadir', 'Tidak Hadir', 'Izin', 'Sakit'];

  const loadStudents = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/students/`);
      const data = await response.json();
      setStudents(data.data || []);
      
      const attResponse = await fetch(`${API_BASE_URL}/attendances/`);
      const attData = await attResponse.json();
      setAttendances(attData.data || []);
    } catch (error) {
      console.error('Error loading students:', error);
      Alert.alert('Error', 'Gagal memuat data siswa');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
    const unsubscribe = navigation?.addListener('focus', () => {
      loadStudents();
    });
    return unsubscribe;
  }, [navigation]);

  const isAlreadyAbsent = (student) => {
    return attendances.some(a => a.nim === student.nim && a.date === selectedDate);
  };

  const handleSave = async () => {
    if (!selectedStudent) {
      Alert.alert('Error', 'Pilih siswa terlebih dahulu');
      return;
    }
    if (!selectedStatus) {
      Alert.alert('Error', 'Pilih status kehadiran');
      return;
    }

    setSaving(true);

    const alreadyAbsent = attendances.some(
      a => a.nim === selectedStudent.nim && a.date === selectedDate
    );

    if (alreadyAbsent) {
      Alert.alert('Info', `${selectedStudent.name} sudah diisi absensinya untuk tanggal ${formatDisplayDate(selectedDate)}`);
      setSaving(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/attendances/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nim: selectedStudent.nim,
          date: selectedDate,
          status: selectedStatus,
        }),
      });
      
      const result = await response.json();

      if (result.status === 201) {
        Alert.alert('Berhasil', `Absensi ${selectedStudent.name} untuk tanggal ${formatDisplayDate(selectedDate)} berhasil disimpan`);
        setSelectedStudent(null);
        setSelectedStatus('');
        await loadStudents();
      } else {
        Alert.alert('Error', result.message || 'Gagal menyimpan');
      }
    } catch (error) {
      console.error('Error saving attendance:', error);
      Alert.alert('Error', 'Terjadi kesalahan saat menyimpan');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setSelectedStudent(null);
    setSelectedStatus('');
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Formulir Kehadiran</Text>
      <Text style={styles.subtitle}>
        Silakan isi data kehadiran siswa dengan teliti untuk laporan harian.
      </Text>

      <Card style={styles.formCard}>
        {/* Input Tanggal Manual */}
        <View style={styles.dateContainer}>
          <Text style={styles.label}>Tanggal (YYYY-MM-DD)</Text>
          <TextInput
            style={styles.dateInput}
            placeholder="2024-06-07"
            value={selectedDate}
            onChangeText={setSelectedDate}
          />
        </View>

        {/* Pilih Siswa */}
        <TouchableOpacity 
          style={styles.studentSelector}
          onPress={() => setShowStudentList(!showStudentList)}
        >
          <Text style={styles.label}>Nama Siswa</Text>
          <Text style={styles.selectedStudent}>
            {selectedStudent ? selectedStudent.name : (loading ? 'Memuat...' : 'Pilih siswa...')}
          </Text>
        </TouchableOpacity>

        {showStudentList && !loading && (
          <View style={styles.studentList}>
            {students.map(student => {
              const alreadyAbsent = isAlreadyAbsent(student);
              return (
                <TouchableOpacity
                  key={student.nim}
                  style={[styles.studentOption, alreadyAbsent && styles.studentOptionDisabled]}
                  onPress={() => {
                    if (alreadyAbsent) {
                      Alert.alert('Info', `${student.name} sudah mengisi absensi untuk tanggal ${formatDisplayDate(selectedDate)}`);
                    } else {
                      setSelectedStudent(student);
                      setShowStudentList(false);
                    }
                  }}
                >
                  <Text style={[styles.studentOptionName, alreadyAbsent && styles.studentOptionTextDisabled]}>
                    {student.name}
                  </Text>
                  <Text style={[styles.studentOptionNim, alreadyAbsent && styles.studentOptionTextDisabled]}>
                    NIM: {student.nim}
                  </Text>
                  <Text style={[styles.studentOptionClass, alreadyAbsent && styles.studentOptionTextDisabled]}>
                    {student.class}
                  </Text>
                  {alreadyAbsent && <Text style={styles.alreadyAbsentText}>✓ Sudah absen</Text>}
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Status */}
        <Text style={styles.label}>Status</Text>
        <View style={styles.statusContainer}>
          {statusOptions.map(status => (
            <TouchableOpacity
              key={status}
              style={[styles.statusOption, selectedStatus === status && styles.statusOptionSelected]}
              onPress={() => setSelectedStatus(status)}
            >
              <Text style={[styles.statusText, selectedStatus === status && styles.statusTextSelected]}>
                {status}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.note}>
          ℹ️ Status "Hadir" akan secara otomatis memperbarui persentase kehadiran mingguan siswa tersebut.
        </Text>

        <View style={styles.buttonContainer}>
          <Button title="Simpan" onPress={handleSave} loading={saving} disabled={!selectedStudent || !selectedStatus} />
          <Button title="Batal" variant="secondary" onPress={handleReset} />
        </View>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface, padding: spacing.md },
  title: { ...typography.headlineMedium, color: colors.onSurface, marginBottom: spacing.xs },
  subtitle: { ...typography.bodyMedium, color: colors.onSurfaceVariant, marginBottom: spacing.lg },
  formCard: { padding: spacing.lg },
  dateContainer: { marginBottom: spacing.md },
  dateInput: { height: spacing.touchTarget, borderWidth: 1, borderColor: colors.outlineVariant, borderRadius: 8, paddingHorizontal: spacing.md, ...typography.bodyMedium, color: colors.onSurface, backgroundColor: colors.white },
  studentSelector: { marginBottom: spacing.md, paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.outlineVariant },
  label: { ...typography.labelMedium, color: colors.onSurfaceVariant, marginBottom: spacing.xs },
  selectedStudent: { ...typography.bodyLarge, color: colors.primary, paddingVertical: spacing.sm },
  studentList: { backgroundColor: colors.white, borderRadius: 8, borderWidth: 1, borderColor: colors.outlineVariant, maxHeight: 250, marginBottom: spacing.md },
  studentOption: { padding: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.outlineVariant },
  studentOptionDisabled: { backgroundColor: colors.surfaceContainerHighest },
  studentOptionName: { ...typography.bodyMedium, color: colors.onSurface, fontWeight: '500' },
  studentOptionNim: { ...typography.labelSmall, color: colors.outline, marginTop: 2 },
  studentOptionClass: { ...typography.labelSmall, color: colors.secondary, marginTop: 2 },
  studentOptionTextDisabled: { color: colors.outline },
  alreadyAbsentText: { ...typography.labelSmall, color: colors.present, marginTop: 4 },
  statusContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md },
  statusOption: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: 20, backgroundColor: colors.surfaceContainerHighest },
  statusOptionSelected: { backgroundColor: colors.primary },
  statusText: { ...typography.labelMedium, color: colors.onSurfaceVariant },
  statusTextSelected: { color: colors.white },
  note: { ...typography.bodyMedium, color: colors.outline, marginBottom: spacing.lg, padding: spacing.sm, backgroundColor: colors.surfaceContainerHighest, borderRadius: 8 },
  buttonContainer: { flexDirection: 'row', gap: spacing.md },
});