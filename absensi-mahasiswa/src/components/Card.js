import React from 'react';
import { View, StyleSheet } from 'react-native';
import colors from '../styles/colors';
import spacing from '../styles/spacing';
import shadows from '../styles/shadows';

export default function Card({ children, style = {}, noPadding = false }) {
  return (
    <View style={[styles.card, style]}>
      <View style={noPadding ? null : styles.padding}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 16,
    ...shadows.level1,
  },
  padding: {
    padding: spacing.md,
  },
});