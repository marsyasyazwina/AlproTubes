import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import colors from '../styles/colors';
import typography from '../styles/typography';

export default function AttendanceChip({ status }) {
  const getStatusStyle = () => {
    switch (status) {
      case 'Hadir': return styles.present;
      case 'Tidak Hadir': return styles.absent;
      case 'Izin': return styles.permission;
      case 'Sakit': return styles.sick;
      default: return styles.default;
    }
  };

  const getTextStyle = () => {
    switch (status) {
      case 'Hadir': return styles.presentText;
      case 'Tidak Hadir': return styles.absentText;
      case 'Izin': return styles.permissionText;
      case 'Sakit': return styles.sickText;
      default: return styles.defaultText;
    }
  };

  return (
    <View style={[styles.chip, getStatusStyle()]}>
      <Text style={[styles.text, getTextStyle()]}>{status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 9999,
    minWidth: 80,
    alignItems: 'center',
  },
  text: {
    ...typography.labelMedium,
  },
  present: { backgroundColor: '#E8F5E9' },
  presentText: { color: colors.present },
  absent: { backgroundColor: '#FFEBEE' },
  absentText: { color: colors.absent },
  permission: { backgroundColor: '#FFF8E1' },
  permissionText: { color: colors.permission },
  sick: { backgroundColor: '#FFF3E0' },
  sickText: { color: colors.sick },
  default: { backgroundColor: colors.surfaceContainerHighest },
  defaultText: { color: colors.onSurfaceVariant },
});