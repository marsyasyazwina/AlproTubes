import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import colors from '../styles/colors';
import typography from '../styles/typography';
import spacing from '../styles/spacing';
import AttendanceChip from './AttendanceChip';

export default function StudentItem({ 
  student, 
  attendanceStatus, 
  date,
  onPress 
}) {
  const getInitials = (name) => {
    const words = name.split(' ');
    if (words.length >= 2) {
      return `${words[0][0]}${words[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{getInitials(student.name)}</Text>
      </View>
      
      <View style={styles.info}>
        <Text style={styles.name}>{student.name}</Text>
        <Text style={styles.nim}>NIM: {student.nim}</Text>
        <Text style={styles.class}>{student.class}</Text>
        {date && <Text style={styles.date}>{date}</Text>}
      </View>
      
      {attendanceStatus && (
        <AttendanceChip status={attendanceStatus} />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    minHeight: 72,
    borderBottomWidth: 1,
    borderBottomColor: colors.outlineVariant,
    backgroundColor: colors.surfaceContainerLowest,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primaryContainer,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  avatarText: {
    ...typography.labelLarge,
    color: colors.onPrimaryContainer,
  },
  info: {
    flex: 1,
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
  class: {
    ...typography.labelMedium,
    color: colors.outline,
    marginTop: 2,
  },
  date: {
    ...typography.labelSmall,
    color: colors.secondary,
    marginTop: 2,
  },
});