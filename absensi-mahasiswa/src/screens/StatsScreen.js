import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Platform,
} from 'react-native';
import colors from '../styles/colors';
import typography from '../styles/typography';
import spacing from '../styles/spacing';
import Card from '../components/Card';

const API_BASE_URL = 'http://localhost:8080/api';

// Komponen RankingItem di dalam file yang sama
const RankingItem = ({ rank, name, nim, persentase, totalHadir, totalTidak }) => {
  const getRankColor = () => {
    if (rank === 1) return '#FFD700';
    if (rank === 2) return '#C0C0C0';
    if (rank === 3) return '#CD7F32';
    return colors.surfaceContainerHighest;
  };

  const persentaseAngka = typeof persentase === 'number' ? persentase : 0;

  return (
    <View style={styles.rankingCard}>
      <View style={[styles.rankCircle, { backgroundColor: getRankColor() }]}>
        <Text style={styles.rankText}>{rank}</Text>
      </View>
      
      <View style={styles.rankingInfo}>
        <View style={styles.nameRow}>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.nim}>{nim}</Text>
        </View>
        <Text style={styles.stats}>
          {totalHadir} Hari Hadir • {totalTidak} Hari Tidak
        </Text>
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBar, { width: `${persentaseAngka}%` }]} />
        </View>
        <Text style={styles.persentase}>Persentase Kehadiran: {persentaseAngka.toFixed(1)}%</Text>
      </View>
    </View>
  );
};

export default function StatsScreen() {
  const [ranking, setRanking] = useState([]);
  const [summary, setSummary] = useState({
    averagePercentage: 0,
    totalStudents: 0,
    totalHadir: 0,
    totalTidakHadir: 0,
    izinSakit: 0
  });
  const [sortAscending, setSortAscending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Load ranking dari API
  const loadRanking = async (sort = 'desc') => {
    try {
      const response = await fetch(`${API_BASE_URL}/stats/ranking?sort=${sort}`);
      const data = await response.json();
      
      if (data.status === 200 && data.data && data.data.length > 0) {
        setRanking(data.data);
        
        // Hitung rata-rata kehadiran
        const total = data.data.reduce((sum, s) => sum + (s.persentase || 0), 0);
        const avg = total / data.data.length;
        setSummary(prev => ({
          ...prev,
          averagePercentage: avg,
          totalStudents: data.data.length
        }));
      } else {
        setRanking([]);
      }
    } catch (error) {
      console.error('Error loading ranking:', error);
      setRanking([]);
    }
  };

  // Load summary dari API today stats
  const loadSummary = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/stats/today`);
      const data = await response.json();
      
      if (data.status === 200 && data.data) {
        const stats = data.data;
        const totalStudents = stats.totalStudents || 1;
        const izinSakitPersen = ((stats.izin || 0) + (stats.sakit || 0)) / totalStudents * 100;
        
        setSummary(prev => ({
          ...prev,
          totalHadir: stats.hadir || 0,
          totalTidakHadir: stats.tidakHadir || 0,
          izinSakit: izinSakitPersen.toFixed(1)
        }));
      }
    } catch (error) {
      console.error('Error loading summary:', error);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    await Promise.all([
      loadRanking(sortAscending ? 'asc' : 'desc'),
      loadSummary()
    ]);
    setLoading(false);
    setRefreshing(false);
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleSort = (ascending) => {
    setSortAscending(ascending);
    loadRanking(ascending ? 'asc' : 'desc');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Memuat data statistik...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container} 
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <Text style={styles.title}>Statistik Kehadiran</Text>
      <Text style={styles.subtitle}>Semester Ganjil 2023/2024</Text>

      {/* Summary Cards */}
      <View style={styles.summaryContainer}>
        <Card style={styles.summaryCard}>
          <Text style={styles.summaryNumber}>{summary.averagePercentage.toFixed(1)}%</Text>
          <Text style={styles.summaryLabel}>Rata-rata Kehadiran</Text>
          <Text style={styles.summaryTrend}>Dari {summary.totalStudents} Mahasiswa</Text>
        </Card>

        <Card style={styles.summaryCard}>
          <Text style={[styles.summaryNumber, styles.hadirNumber]}>{summary.totalHadir}</Text>
          <Text style={styles.summaryLabel}>Hadir Hari Ini</Text>
          <Text style={styles.summaryTrend}>Efisiensi Input</Text>
        </Card>

        <Card style={styles.summaryCard}>
          <Text style={[styles.summaryNumber, styles.izinSakitNumber]}>{summary.izinSakit}%</Text>
          <Text style={styles.summaryLabel}>Izin / Sakit</Text>
          <Text style={styles.summaryTrend}>Distribusi Status</Text>
        </Card>
      </View>

      {/* Ranking Section */}
      <View style={styles.rankingSection}>
        <Text style={styles.sectionTitle}>Peringkat Kehadiran Mahasiswa</Text>
        <Text style={styles.sectionSubtitle}>Berdasarkan Persentase Kehadiran</Text>

        <View style={styles.sortButtons}>
          <TouchableOpacity
            style={[styles.sortButton, !sortAscending && styles.sortButtonActive]}
            onPress={() => handleSort(false)}
          >
            <Text style={[styles.sortButtonText, !sortAscending && styles.sortButtonTextActive]}>
              Tertinggi → Terendah
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.sortButton, sortAscending && styles.sortButtonActive]}
            onPress={() => handleSort(true)}
          >
            <Text style={[styles.sortButtonText, sortAscending && styles.sortButtonTextActive]}>
              Terendah → Tertinggi
            </Text>
          </TouchableOpacity>
        </View>

        {ranking.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>📊</Text>
            <Text style={styles.emptyText}>Belum ada data kehadiran</Text>
            <Text style={styles.emptySubText}>Input absensi terlebih dahulu untuk melihat statistik</Text>
          </Card>
        ) : (
          ranking.map((student, index) => (
            <RankingItem
              key={student.nim}
              rank={index + 1}
              name={student.name}
              nim={student.nim}
              persentase={student.persentase}
              totalHadir={student.totalHadir}
              totalTidak={student.totalTidak}
            />
          ))
        )}
      </View>

      {/* Info Card */}
      <Card style={styles.infoCard}>
        <Text style={styles.infoTitle}>ℹ️ Informasi</Text>
        <Text style={styles.infoText}>
          • Persentase kehadiran dihitung berdasarkan total kehadiran (Hadir) dibagi total pertemuan
        </Text>
        <Text style={styles.infoText}>
          • Data diperbarui secara otomatis setiap kali absensi diinput
        </Text>
        <Text style={styles.infoText}>
          • Gunakan tombol sorting untuk mengubah urutan peringkat
        </Text>
      </Card>
    </ScrollView>
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
  summaryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  summaryCard: {
    flex: 1,
    minWidth: 100,
    alignItems: 'center',
    padding: spacing.md,
  },
  summaryNumber: {
    ...typography.headlineMedium,
    color: colors.primary,
  },
  hadirNumber: {
    color: colors.present,
  },
  izinSakitNumber: {
    color: colors.permission,
  },
  summaryLabel: {
    ...typography.labelMedium,
    color: colors.onSurfaceVariant,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  summaryTrend: {
    ...typography.labelSmall,
    color: colors.outline,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  rankingSection: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.headlineSmall,
    color: colors.onSurface,
    marginBottom: spacing.xs,
  },
  sectionSubtitle: {
    ...typography.bodyMedium,
    color: colors.onSurfaceVariant,
    marginBottom: spacing.md,
  },
  sortButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  sortButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: colors.surfaceContainerHighest,
  },
  sortButtonActive: {
    backgroundColor: colors.primary,
  },
  sortButtonText: {
    ...typography.labelMedium,
    color: colors.onSurfaceVariant,
  },
  sortButtonTextActive: {
    color: colors.onPrimary,
  },
  emptyCard: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  emptyText: {
    ...typography.bodyLarge,
    color: colors.outline,
    textAlign: 'center',
  },
  emptySubText: {
    ...typography.bodyMedium,
    color: colors.outline,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  infoCard: {
    padding: spacing.md,
    backgroundColor: colors.surfaceContainerHighest,
    marginBottom: spacing.xl,
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
  // Ranking Item styles
  rankingCard: {
    flexDirection: 'row',
    padding: spacing.md,
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 16,
    marginBottom: spacing.md,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  rankCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  rankText: {
    ...typography.headlineSmall,
    color: colors.onSurface,
  },
  rankingInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    ...typography.bodyLarge,
    color: colors.onSurface,
    fontWeight: '600',
  },
  nim: {
    ...typography.bodyMedium,
    color: colors.onSurfaceVariant,
  },
  stats: {
    ...typography.bodyMedium,
    color: colors.onSurfaceVariant,
    marginBottom: 8,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: colors.surfaceContainerHighest,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.present,
    borderRadius: 4,
  },
  persentase: {
    ...typography.labelMedium,
    color: colors.primary,
  },
});