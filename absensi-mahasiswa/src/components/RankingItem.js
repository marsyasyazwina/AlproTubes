import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import colors from '../styles/colors';
import typography from '../styles/typography';
import spacing from '../styles/spacing';

export default function RankingItem({ rank, name, nim, persentase, totalHadir, totalTidak }) {
  const getRankColor = () => {
    if (rank === 1) return '#FFD700';
    if (rank === 2) return '#C0C0C0';
    if (rank === 3) return '#CD7F32';
    return colors.surfaceContainerHighest;
  };

  return (
    <View style={styles.container}>
      <View style={[styles.rankCircle, { backgroundColor: getRankColor() }]}>
        <Text style={styles.rankText}>{rank}</Text>
      </View>
      
      <View style={styles.info}>
        <View style={styles.nameRow}>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.nim}>{nim}</Text>
        </View>
        <Text style={styles.stats}>
          {totalHadir} Hari Hadir • {totalTidak} Hari Tidak
        </Text>
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBar, { width: `${persentase}%` }]} />
        </View>
        <Text style={styles.persentase}>Persentase Kehadiran: {persentase}%</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
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
  info: {
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