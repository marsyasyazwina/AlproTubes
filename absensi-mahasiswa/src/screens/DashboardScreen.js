import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
} from 'react-native';
import colors from '../styles/colors';
import typography from '../styles/typography';
import spacing from '../styles/spacing';
import shadows from '../styles/shadows';
import Card from '../components/Card';
import WeeklyChart from '../components/WeeklyChart';
import { api } from '../services/api';
import { formatDate, getTodayDate } from '../utils/helpers';
import { weeklyData } from '../utils/mockData';

export default function DashboardScreen() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const todayDate = getTodayDate();
  const formattedDate = formatDate(todayDate);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    const data = await api.getTodayStats();
    setStats(data);
    setLoading(false);
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
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.date}>{formattedDate}</Text>
        <Text style={styles.greeting}>Halo, Admin</Text>
      </View>

      <View style={styles.statsContainer}>
        <Card style={styles.statCard}>
          <Text style={styles.statNumber}>{stats?.totalStudents || 0}</Text>
          <Text style={styles.statLabel}>TOTAL SISWA</Text>
          <Text style={styles.statSubLabel}>Data Terdaftar</Text>
        </Card>

        <Card style={styles.statCard}>
          <Text style={[styles.statNumber, styles.hadirNumber]}>{stats?.hadir || 0}</Text>
          <Text style={styles.statLabel}>HADIR HARI INI</Text>
          <Text style={styles.statPercent}>{stats?.persentaseHadir?.toFixed(1) || 0}%</Text>
        </Card>

        <Card style={styles.statCard}>
          <Text style={[styles.statNumber, styles.tidakHadirNumber]}>{stats?.tidakHadir || 0}</Text>
          <Text style={styles.statLabel}>TIDAK HADIR</Text>
          <Text style={styles.statSubLabel}>📍 Perlu Tindak Lanjut</Text>
        </Card>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Kehadiran Minggu Ini</Text>
          <TouchableOpacity>
            <Text style={styles.sectionLink}>Detail</Text>
          </TouchableOpacity>
        </View>
        <WeeklyChart data={weeklyData} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Pemberitahuan Terbaru</Text>
        <Card style={styles.notificationCard}>
          <Text style={styles.notificationTitle}>Rapat Guru mengenai kurikulum baru</Text>
          <Text style={styles.notificationTime}>Baru saja • Ruang Guru</Text>
        </Card>
        <Card style={styles.notificationCard}>
          <Text style={styles.notificationTitle}>Update sistem absensi versi 2.4.0</Text>
          <Text style={styles.notificationTime}>2 jam yang lalu • Sistem</Text>
        </Card>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
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
  header: {
    padding: spacing.md,
    backgroundColor: colors.surfaceContainerLowest,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    ...shadows.level1,
  },
  date: {
    ...typography.bodyMedium,
    color: colors.onSurfaceVariant,
  },
  greeting: {
    ...typography.headlineMedium,
    color: colors.onSurface,
    marginTop: spacing.xs,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: spacing.md,
    gap: spacing.md,
  },
  statCard: {
    flex: 1,
    minWidth: 100,
    alignItems: 'center',
  },
  statNumber: {
    ...typography.headlineLarge,
    color: colors.primary,
  },
  hadirNumber: { color: colors.present },
  tidakHadirNumber: { color: colors.absent },
  statLabel: {
    ...typography.labelMedium,
    color: colors.onSurfaceVariant,
    marginTop: spacing.xs,
  },
  statSubLabel: {
    ...typography.labelSmall,
    color: colors.outline,
    marginTop: spacing.xs,
  },
  statPercent: {
    ...typography.labelSmall,
    color: colors.present,
    marginTop: spacing.xs,
  },
  section: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
  },
  lastSection: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.headlineSmall,
    color: colors.onSurface,
  },
  sectionLink: {
    ...typography.labelMedium,
    color: colors.secondary,
  },
  notificationCard: {
    marginBottom: spacing.sm,
    padding: spacing.md,
  },
  notificationTitle: {
    ...typography.bodyMedium,
    color: colors.onSurface,
    fontWeight: '600',
  },
  notificationTime: {
    ...typography.labelSmall,
    color: colors.outline,
    marginTop: spacing.xs,
  },
  helpCard: {
    padding: spacing.md,
    alignItems: 'center',
  },
  helpText: {
    ...typography.bodyMedium,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
  },
  helpButton: {
    marginTop: spacing.md,
  },
  helpButtonText: {
    ...typography.labelLarge,
    color: colors.secondary,
  },
});