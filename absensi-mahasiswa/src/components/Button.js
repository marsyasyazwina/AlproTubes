import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import colors from '../styles/colors';
import typography from '../styles/typography';
import spacing from '../styles/spacing';

export default function Button({ 
  title, 
  onPress, 
  variant = 'primary', 
  disabled = false, 
  loading = false,
  style = {} 
}) {
  const getButtonStyle = () => {
    if (disabled) return styles.disabled;
    if (variant === 'secondary') return styles.secondary;
    return styles.primary;
  };

  const getTextStyle = () => {
    if (variant === 'secondary') return styles.secondaryText;
    return styles.primaryText;
  };

  return (
    <TouchableOpacity
      style={[styles.button, getButtonStyle(), style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={colors.onPrimary} />
      ) : (
        <Text style={[styles.text, getTextStyle()]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    height: spacing.touchTarget,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
  },
  primary: {
    backgroundColor: colors.primary,
  },
  secondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  disabled: {
    backgroundColor: colors.surfaceContainerHighest,
  },
  text: {
    ...typography.labelLarge,
  },
  primaryText: {
    color: colors.onPrimary,
  },
  secondaryText: {
    color: colors.primary,
  },
});