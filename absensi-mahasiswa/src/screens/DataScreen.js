import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Platform,
  Modal,
  ActivityIndicator,
  TextInput,
  RefreshControl,
} from 'react-native';
import colors from '../styles/colors';
import typography from '../styles/typography';
import spacing from '../styles/spacing';
import Card from '../components/Card';
import Button from '../components/Button';
import { getTodayDate, formatDisplayDate } from '../utils/helpers';

const API_BASE_URL = 'http://localhost:8080/api';

export default function DataScreen() {
  const [students, setStudents] = useState([]);
  const [attendances, setAttendances] = useState([]);
  const [rankings, setRankings] = useState([]); // Untuk menyimpan persentase
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [saving, setSaving] = useState(false);
  
  // Form tambah
  const [newStudent, setNewStudent] = useState({ name: '', class: '', major: '' });
  
  // Form edit
  const [editingStudent, setEditingStudent] = useState({ nim: '', name: '', class: '', major: '' });
  
  const todayDate = getTodayDate();
  const statusOptions = ['Hadir', 'Tidak Hadir', 'Izin', 'Sakit'];

  // LOAD SEMUA DATA
  const loadData = async () => {
    try {
      setLoading(true);
      console.log('Loading data from API...');
      
      // Load students
      const studentsRes = await fetch(`${API_BASE_URL}/students/`);
      const studentsData = await studentsRes.json();
      setStudents(studentsData.data || []);
      
      // Load attendances
      const attendancesRes = await fetch(`${API_BASE_URL}/attendances/`);
      const attendancesData = await attendancesRes.json();
      setAttendances(attendancesData.data || []);
      
      // Load rankings untuk persentase
      const rankingsRes = await fetch(`${API_BASE_URL}/stats/ranking?sort=desc`);
      const rankingsData = await rankingsRes.json();
      setRankings(rankingsData.data || []);
      
      console.log('Students loaded:', studentsData.data?.length);
      console.log('Rankings loaded:', rankingsData.data?.length);
    } catch (error) {
      console.error('Load error:', error);
      Alert.alert('Error', 'Gagal memuat data. Pastikan backend running di port 8080');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  // Ambil persentase kehadiran dari data ranking
  const getPersentase = (nim) => {
    const ranking = rankings.find(r => r.nim === nim);
    return ranking ? ranking.persentase : 0;
  };

  // TAMBAH MAHASISWA
  const handleAddStudent = async () => {
    if (!newStudent.name.trim()) {
      Alert.alert('Error', 'Nama harus diisi');
      return;
    }
    
    setSaving(true);
    try {
      const response = await fetch(`${API_BASE_URL}/students/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newStudent.name,
          class: newStudent.class || 'Belum diisi',
          major: newStudent.major || 'Belum diisi',
        }),
      });
      
      const result = await response.json();
      
      if (result.status === 201) {
        Alert.alert('Berhasil', 'Mahasiswa ditambahkan');
        setAddModalVisible(false);
        setNewStudent({ name: '', class: '', major: '' });
        loadData();
      } else {
        Alert.alert('Error', result.message || 'Gagal menambah');
      }
    } catch (error) {
      console.error('Add error:', error);
      Alert.alert('Error', 'Terjadi kesalahan');
    } finally {
      setSaving(false);
    }
  };

  // HAPUS MAHASISWA
  const handleDeleteStudent = (student) => {
    Alert.alert(
      'Hapus Mahasiswa',
      `Yakin hapus ${student.name}?`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            setSaving(true);
            try {
              const response = await fetch(`${API_BASE_URL}/students/${student.nim}`, {
                method: 'DELETE',
              });
              
              if (response.ok) {
                Alert.alert('Berhasil', `${student.name} dihapus`);
                loadData();
              } else {
                const result = await response.json();
                Alert.alert('Error', result.message || 'Gagal hapus');
              }
            } catch (error) {
              console.error('Delete error:', error);
              Alert.alert('Error', error.message);
            } finally {
              setSaving(false);
            }
          },
        },
      ]
    );
  };

  // EDIT MAHASISWA
  const handleEditStudent = (student) => {
    setEditingStudent({
      nim: student.nim,
      name: student.name,
      class: student.class,
      major: student.major,
    });
    setEditModalVisible(true);
  };

  const handleSaveEditStudent = async () => {
    if (!editingStudent.name.trim()) {
      Alert.alert('Error', 'Nama harus diisi');
      return;
    }
    
    setSaving(true);
    try {
      const response = await fetch(`${API_BASE_URL}/students/${editingStudent.nim}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editingStudent.name,
          class: editingStudent.class,
          major: editingStudent.major,
        }),
      });
      
      if (response.ok) {
        Alert.alert('Berhasil', 'Data mahasiswa diupdate');
        setEditModalVisible(false);
        loadData();
      } else {
        const result = await response.json();
        Alert.alert('Error', result.message || 'Gagal update');
      }
    } catch (error) {
      console.error('Edit error:', error);
      Alert.alert('Error', 'Terjadi kesalahan');
    } finally {
      setSaving(false);
    }
  };

  // EDIT ABSENSI
  const handleEditAttendance = (student) => {
    const attendance = attendances.find(a => a.nim === student.nim && a.date === todayDate);
    setSelectedStudent(student);
    setSelectedStatus(attendance ? attendance.status : '');
    setModalVisible(true);
  };

  const handleSaveAttendance = async () => {
    if (!selectedStatus) {
      Alert.alert('Error', 'Pilih status');
      return;
    }
    
    setSaving(true);
    try {
      const existing = attendances.find(a => a.nim === selectedStudent.nim && a.date === todayDate);
      
      let response;
      if (existing) {
        response = await fetch(`${API_BASE_URL}/attendances/${existing.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: selectedStatus }),
        });
      } else {
        response = await fetch(`${API_BASE_URL}/attendances/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nim: selectedStudent.nim,
            date: todayDate,
            status: selectedStatus,
          }),
        });
      }
      
      if (response.ok) {
        Alert.alert('Berhasil', 'Absensi disimpan');
        setModalVisible(false);
        setSelectedStudent(null);
        setSelectedStatus('');
        loadData();
      } else {
        Alert.alert('Error', 'Gagal menyimpan');
      }
    } catch (error) {
      console.error('Save attendance error:', error);
      Alert.alert('Error', 'Terjadi kesalahan');
    } finally {
      setSaving(false);
    }
  };

  const getAttendanceStatus = (nim) => {
    const attendance = attendances.find(a => a.nim === nim && a.date === todayDate);
    return attendance ? attendance.status : null;
  };

  const stats = {
    hadir: attendances.filter(a => a.date === todayDate && a.status === 'Hadir').length,
    tidakHadir: attendances.filter(a => a.date === todayDate && a.status === 'Tidak Hadir').length,
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
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.title}>Data Mahasiswa</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => setAddModalVisible(true)}>
          <Text style={styles.addButtonText}>+ Tambah</Text>
        </TouchableOpacity>
      </View>

      {/* STATS */}
      <View style={styles.statsRow}>
        <Card style={styles.statCard}>
          <Text style={[styles.statNumber, styles.hadirNumber]}>{stats.hadir}</Text>
          <Text style={styles.statLabel}>HADIR</Text>
        </Card>
        <Card style={styles.statCard}>
          <Text style={[styles.statNumber, styles.tidakHadirNumber]}>{stats.tidakHadir}</Text>
          <Text style={styles.statLabel}>TIDAK HADIR</Text>
        </Card>
      </View>

      {/* TABLE HEADER */}
      <View style={styles.tableHeader}>
        <Text style={[styles.tableHeaderText, { width: 45 }]}>NO</Text>
        <Text style={[styles.tableHeaderText, { flex: 2 }]}>NAMA</Text>
        <Text style={[styles.tableHeaderText, { width: 70 }]}>STATUS</Text>
        <Text style={[styles.tableHeaderText, { width: 100 }]}>PERSENTASE</Text>
        <Text style={[styles.tableHeaderText, { width: 110 }]}>AKSI</Text>
      </View>

      {/* LIST */}
      <FlatList
        data={students}
        keyExtractor={(item) => item.nim}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        renderItem={({ item, index }) => {
          const status = getAttendanceStatus(item.nim);
          const persentase = getPersentase(item.nim);
          return (
            <View style={styles.row}>
              <Text style={[styles.cellText, { width: 45 }]}>{index + 1}</Text>
              <View style={{ flex: 2 }}>
                <Text style={styles.nameText}>{item.name}</Text>
                <Text style={styles.nimText}>{item.nim}</Text>
                <Text style={styles.classText}>{item.class}</Text>
              </View>
              <View style={{ width: 70, alignItems: 'center' }}>
                <View style={[styles.statusBadge, status === 'Hadir' && styles.statusHadir, status === 'Tidak Hadir' && styles.statusTidak]}>
                  <Text style={[styles.statusText, status === 'Hadir' && styles.statusTextHadir, status === 'Tidak Hadir' && styles.statusTextTidak]}>
                    {status || 'Belum'}
                  </Text>
                </View>
              </View>
              <View style={{ width: 100 }}>
                <View style={[styles.persentaseBar, { width: `${persentase}%` }]} />
                <Text style={styles.persentaseText}>{persentase.toFixed(1)}%</Text>
              </View>
              <View style={{ width: 110, flexDirection: 'row', gap: 5 }}>
                <TouchableOpacity style={[styles.actionBtn, styles.attendanceBtn]} onPress={() => handleEditAttendance(item)}>
                  <Text style={styles.actionBtnText}>{status ? 'Edit' : 'Isi'}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionBtn, styles.editBtn]} onPress={() => handleEditStudent(item)}>
                  <Text style={styles.actionBtnText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionBtn, styles.deleteBtn]} onPress={() => handleDeleteStudent(item)}>
                  <Text style={[styles.actionBtnText, { color: colors.error }]}>Hapus</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Belum ada data mahasiswa</Text>
            <Text style={styles.emptySubText}>Tekan tombol "+ Tambah"</Text>
          </View>
        }
      />

      <Text style={styles.footerText}>Total: {students.length} mahasiswa</Text>

      {/* MODAL TAMBAH */}
      <Modal visible={addModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Tambah Mahasiswa</Text>
            <TextInput style={styles.input} placeholder="Nama lengkap" value={newStudent.name} onChangeText={t => setNewStudent({...newStudent, name: t})} />
            <TextInput style={styles.input} placeholder="Kelas" value={newStudent.class} onChangeText={t => setNewStudent({...newStudent, class: t})} />
            <TextInput style={styles.input} placeholder="Jurusan" value={newStudent.major} onChangeText={t => setNewStudent({...newStudent, major: t})} />
            <View style={styles.modalButtons}>
              <Button title="Simpan" onPress={handleAddStudent} loading={saving} />
              <Button title="Batal" variant="secondary" onPress={() => { setAddModalVisible(false); setNewStudent({ name: '', class: '', major: '' }); }} />
            </View>
          </View>
        </View>
      </Modal>

      {/* MODAL EDIT MAHASISWA */}
      <Modal visible={editModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Mahasiswa</Text>
            <Text style={styles.modalSubtitle}>NIM: {editingStudent.nim}</Text>
            <TextInput style={styles.input} placeholder="Nama lengkap" value={editingStudent.name} onChangeText={t => setEditingStudent({...editingStudent, name: t})} />
            <TextInput style={styles.input} placeholder="Kelas" value={editingStudent.class} onChangeText={t => setEditingStudent({...editingStudent, class: t})} />
            <TextInput style={styles.input} placeholder="Jurusan" value={editingStudent.major} onChangeText={t => setEditingStudent({...editingStudent, major: t})} />
            <View style={styles.modalButtons}>
              <Button title="Simpan" onPress={handleSaveEditStudent} loading={saving} />
              <Button title="Batal" variant="secondary" onPress={() => setEditModalVisible(false)} />
            </View>
          </View>
        </View>
      </Modal>

      {/* MODAL EDIT ABSENSI */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Absensi</Text>
            <Text style={styles.modalStudentName}>{selectedStudent?.name}</Text>
            <Text style={styles.modalDate}>{formatDisplayDate(todayDate)}</Text>
            <View style={styles.statusOptions}>
              {statusOptions.map(s => (
                <TouchableOpacity key={s} style={[styles.statusOption, selectedStatus === s && styles.statusOptionSelected]} onPress={() => setSelectedStatus(s)}>
                  <Text style={[styles.statusOptionText, selectedStatus === s && { color: colors.white }]}>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.modalButtons}>
              <Button title="Simpan" onPress={handleSaveAttendance} loading={saving} />
              <Button title="Batal" variant="secondary" onPress={() => { setModalVisible(false); setSelectedStudent(null); setSelectedStatus(''); }} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface, padding: spacing.md },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.surface },
  loadingText: { ...typography.bodyMedium, color: colors.outline, marginTop: spacing.md },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  title: { ...typography.headlineMedium, color: colors.onSurface },
  addButton: { backgroundColor: colors.present, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: 8 },
  addButtonText: { ...typography.labelMedium, color: colors.white },
  statsRow: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.lg },
  statCard: { flex: 1, alignItems: 'center', padding: spacing.md },
  statNumber: { ...typography.headlineMedium },
  hadirNumber: { color: colors.present },
  tidakHadirNumber: { color: colors.absent },
  statLabel: { ...typography.labelMedium, color: colors.onSurfaceVariant, marginTop: spacing.xs },
  tableHeader: { flexDirection: 'row', backgroundColor: colors.surfaceContainerHighest, padding: spacing.sm, borderRadius: 8, marginBottom: spacing.sm },
  tableHeaderText: { ...typography.labelMedium, color: colors.onSurfaceVariant, fontWeight: '600' },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.sm, paddingHorizontal: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.outlineVariant },
  cellText: { ...typography.bodyMedium, color: colors.onSurfaceVariant },
  nameText: { ...typography.bodyMedium, color: colors.onSurface, fontWeight: '500' },
  nimText: { ...typography.labelSmall, color: colors.outline, marginTop: 2 },
  classText: { ...typography.labelSmall, color: colors.secondary, marginTop: 2 },
  statusBadge: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: 12, minWidth: 60, alignItems: 'center' },
  statusHadir: { backgroundColor: '#E8F5E9' },
  statusTidak: { backgroundColor: '#FFEBEE' },
  statusText: { ...typography.labelSmall },
  statusTextHadir: { color: colors.present },
  statusTextTidak: { color: colors.absent },
  persentaseBar: { height: 4, backgroundColor: colors.present, borderRadius: 2, marginBottom: 4 },
  persentaseText: { ...typography.labelSmall, color: colors.primary, textAlign: 'center' },
  actionBtn: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: 6, minWidth: 35, alignItems: 'center' },
  attendanceBtn: { backgroundColor: colors.primaryContainer },
  editBtn: { backgroundColor: colors.secondaryContainer },
  deleteBtn: { backgroundColor: colors.errorContainer },
  actionBtnText: { ...typography.labelSmall, color: colors.onPrimaryContainer },
  emptyContainer: { padding: spacing.xl, alignItems: 'center' },
  emptyText: { ...typography.bodyLarge, color: colors.outline, textAlign: 'center' },
  emptySubText: { ...typography.bodyMedium, color: colors.outline, textAlign: 'center', marginTop: spacing.sm },
  footerText: { ...typography.labelMedium, color: colors.outline, textAlign: 'center', marginTop: spacing.md, paddingBottom: spacing.md },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: colors.white, borderRadius: 24, padding: spacing.lg, width: '85%' },
  modalTitle: { ...typography.headlineSmall, color: colors.onSurface, textAlign: 'center', marginBottom: spacing.md },
  modalSubtitle: { ...typography.bodyMedium, color: colors.outline, textAlign: 'center', marginBottom: spacing.md },
  modalStudentName: { ...typography.bodyLarge, color: colors.onSurface, fontWeight: '600', textAlign: 'center' },
  modalDate: { ...typography.bodyMedium, color: colors.secondary, textAlign: 'center', marginBottom: spacing.md },
  input: { height: spacing.touchTarget, borderWidth: 1, borderColor: colors.outlineVariant, borderRadius: 8, paddingHorizontal: spacing.md, marginBottom: spacing.md, ...typography.bodyMedium, color: colors.onSurface, backgroundColor: colors.white },
  statusOptions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.lg },
  statusOption: { flex: 1, paddingVertical: spacing.sm, alignItems: 'center', borderRadius: 8, backgroundColor: colors.surfaceContainerHighest },
  statusOptionSelected: { backgroundColor: colors.primary },
  statusOptionText: { ...typography.labelMedium, color: colors.onSurfaceVariant },
  modalButtons: { gap: spacing.sm },
});