import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import colors from '../styles/colors';
import typography from '../styles/typography';
import spacing from '../styles/spacing';

export default function WeeklyChart({ data }) {
  const maxValue = Math.max(...data.map(d => Math.max(d.hadir, d.tidakHadir, d.izin, d.sakit)));

  const getBarHeight = (value) => {
    if (maxValue === 0) return 0;
    return (value / maxValue) * 60;
  };

  return (
    <View style={styles.container}>
      <View style={styles.chartContainer}>
        {data.map((item, index) => (
          <View key={index} style={styles.dayColumn}>
            <View style={styles.barsContainer}>
              <View style={styles.barWrapper}>
                <View 
                  style={[
                    styles.bar, 
                    styles.hadirBar,
                    { height: getBarHeight(item.hadir) }
                  ]} 
                />
              </View>
              <View style={styles.barWrapper}>
                <View 
                  style={[
                    styles.bar, 
                    styles.tidakHadirBar,
                    { height: getBarHeight(item.tidakHadir) }
                  ]} 
                />
              </View>
              <View style={styles.barWrapper}>
                <View 
                  style={[
                    styles.bar, 
                    styles.izinBar,
                    { height: getBarHeight(item.izin) }
                  ]} 
                />
              </View>
              <View style={styles.barWrapper}>
                <View 
                  style={[
                    styles.bar, 
                    styles.sakitBar,
                    { height: getBarHeight(item.sakit) }
                  ]} 
                />
              </View>
            </View>
            <Text style={styles.dayLabel}>{item.day}</Text>
          </View>
        ))}
      </View>
      
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, styles.hadirBar]} />
          <Text style={styles.legendText}>Hadir</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, styles.tidakHadirBar]} />
          <Text style={styles.legendText}>Tidak Hadir</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, styles.izinBar]} />
          <Text style={styles.legendText}>Izin</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, styles.sakitBar]} />
          <Text style={styles.legendText}>Sakit</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 16,
    padding: spacing.md,
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    marginBottom: spacing.md,
  },
  dayColumn: {
    alignItems: 'center',
    flex: 1,
  },
  barsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 80,
    gap: 2,
  },
  barWrapper: {
    alignItems: 'center',
    width: 16,
  },
  bar: {
    width: 12,
    borderRadius: 4,
    minHeight: 2,
  },
  hadirBar: { backgroundColor: colors.present },
  tidakHadirBar: { backgroundColor: colors.absent },
  izinBar: { backgroundColor: colors.permission },
  sakitBar: { backgroundColor: colors.sick },
  dayLabel: {
    ...typography.labelMedium,
    color: colors.onSurfaceVariant,
    marginTop: spacing.sm,
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.md,
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.outlineVariant,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 4,
  },
  legendText: {
    ...typography.labelSmall,
    color: colors.onSurfaceVariant,
  },
});