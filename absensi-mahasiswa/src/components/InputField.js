import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import colors from '../styles/colors';
import typography from '../styles/typography';
import spacing from '../styles/spacing';

export default function InputField({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  keyboardType = 'default',
  error = '',
  multiline = false,
  numberOfLines = 1,
}) {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[
          styles.input,
          multiline && styles.multiline,
          error ? styles.inputError : null,
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        multiline={multiline}
        numberOfLines={numberOfLines}
        placeholderTextColor={colors.outline}
      />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    ...typography.labelMedium,
    color: colors.onSurfaceVariant,
    marginBottom: spacing.xs,
  },
  input: {
    height: spacing.touchTarget,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    ...typography.bodyMedium,
    color: colors.onSurface,
    backgroundColor: colors.surfaceContainerLowest,
  },
  multiline: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: spacing.sm,
  },
  inputError: {
    borderColor: colors.error,
  },
  errorText: {
    ...typography.labelSmall,
    color: colors.error,
    marginTop: spacing.xs,
  },
});